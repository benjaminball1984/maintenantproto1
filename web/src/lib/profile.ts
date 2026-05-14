import { PostgrestError, type SupabaseClient } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type UserRow = Database['public']['Tables']['users']['Row'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

const AVATARS_BUCKET = 'avatars';

/** Limite d'upload côté client (le backend RLS reste l'autorité finale). */
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2 Mo
export const AVATAR_ACCEPTED_TYPES: readonly string[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export interface ProfileResult {
  data: UserRow | null;
  error: PostgrestError | null;
}

export interface AvatarUploadData {
  path: string;
  publicUrl: string;
}

export interface AvatarUploadResult {
  data: AvatarUploadData | null;
  error: PostgrestError | null;
}

/**
 * Lit le profil étendu d'un utilisateur dans `public.users`.
 * Renvoie `data: null` si la ligne n'existe pas encore (signup confirmé mais
 * trigger `handle_new_user` non rejoué).
 */
export async function getProfile(userId: string): Promise<ProfileResult> {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
  return { data, error };
}

/**
 * Met à jour le profil utilisateur. Le mapping `UserUpdate` est sourcé depuis
 * `Database['public']['Tables']['users']['Update']` : aucune clé arbitraire
 * n'est acceptée par TypeScript.
 */
export async function updateProfile(userId: string, patch: UserUpdate): Promise<ProfileResult> {
  const { data, error } = await supabase
    .from('users')
    .update(patch)
    .eq('id', userId)
    .select('*')
    .maybeSingle();
  return { data, error };
}

/** Détermine l'extension à partir du type MIME, fallback sur l'extension d'origine. */
function extensionFromFile(file: File): string {
  const fromType: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  const byType = fromType[file.type];
  if (byType) return byType;
  const dot = file.name.lastIndexOf('.');
  if (dot >= 0 && dot < file.name.length - 1) {
    return file.name.slice(dot + 1).toLowerCase();
  }
  return 'bin';
}

/**
 * Upload un avatar dans le bucket `avatars` sous le préfixe `<userId>/`.
 * Les policies RLS imposent `(storage.foldername(name))[1] = auth.uid()::text`.
 * Renvoie le path et l'URL publique en cas de succès.
 *
 * Les erreurs natives `StorageError` sont remontées au format `PostgrestError`
 * pour rester homogènes côté UI (le mapper `postgrestErrorMessage` les traite).
 */
export async function uploadAvatar(userId: string, file: File): Promise<AvatarUploadResult> {
  if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) {
    return {
      data: null,
      error: new PostgrestError({
        message: 'Format invalide : utilisez une image JPEG, PNG, WebP ou GIF.',
        details: '',
        hint: '',
        code: 'AVATAR_INVALID_TYPE',
      }),
    };
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return {
      data: null,
      error: new PostgrestError({
        message: 'Fichier trop volumineux : 2 Mo maximum.',
        details: '',
        hint: '',
        code: 'AVATAR_TOO_LARGE',
      }),
    };
  }

  const ext = extensionFromFile(file);
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from(AVATARS_BUCKET).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: true,
  });

  if (uploadError) {
    return {
      data: null,
      error: new PostgrestError({
        message: uploadError.message,
        details: '',
        hint: '',
        code: '42501',
      }),
    };
  }

  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  return {
    data: { path, publicUrl: data.publicUrl },
    error: null,
  };
}

// =====================================================================================
// Profil — compteurs contribution + historique d'activité (étape 37).
//
// Toutes les lectures se limitent au `user_id` / `author_id` courant, qui est
// systématiquement autorisé par les policies RLS publiques actuelles
// (`signatures_select_public`, `participations_select_public`,
// `votes_select_public`, `posts_select_visibility` qui inclut
// `auth.uid() = author_id`). Le scope `eq('user_id', userId)` reste robuste
// au futur durcissement RLS sur `signatures_select_public` (cf. dette
// M2-sec § schema.sql) : un filtre côté front sur sa propre uid ne sera
// jamais bloqué par une policy `auth.uid() = user_id`.
//
// Les compteurs utilisent `head: true, count: 'exact'` (aucune ligne
// transférée). L'historique projette `id, created_at` + un libellé (titre
// pétition / mobilisation / sondage / extrait du post) pour rendre la
// timeline sans round-trip supplémentaire — l'embed PostgREST `relation(...)`
// résout les jointures côté DB.
// =====================================================================================

type Client = SupabaseClient<Database>;

export interface ProfileStats {
  /** Pétitions signées. */
  signatures: number;
  /** Mobilisations auxquelles l'utilisateur a RSVP. */
  participations: number;
  /** Votes émis sur les sondages. */
  votes: number;
  /** Posts publiés sur le réseau social. */
  posts: number;
}

export interface ProfileStatsResult {
  data: ProfileStats | null;
  error: PostgrestError | null;
}

async function countSelf(
  client: Client,
  table: 'signatures' | 'participations' | 'votes' | 'posts',
  userColumn: 'user_id' | 'author_id',
  userId: string,
): Promise<{ count: number; error: PostgrestError | null }> {
  // head:true => aucune ligne transférée, seul le count revient. Le helper
  // est trans-tables (`signatures.user_id`, `posts.author_id`), donc
  // l'overload strict de `.eq` (typé sur les colonnes projetées par le
  // `.select`) ne peut pas s'unifier — on cast l'argument en `string` (cf.
  // `transparency.countTable` qui passe `filter.column: string` pour la
  // même raison). Pas de `any` : le générique de PostgrestFilterBuilder
  // retombe sur l'overload string.
  const column: string = userColumn;
  const { count, error } = await client
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq(column, userId);
  return { count: count ?? 0, error };
}

/**
 * Compteurs de contribution pour l'utilisateur courant. Quatre queries
 * parallèles `head: true, count: 'exact'` : aucune ligne transférée.
 */
export async function fetchProfileStats(
  userId: string,
  client: Client = supabase,
): Promise<ProfileStatsResult> {
  const results = await Promise.all([
    countSelf(client, 'signatures', 'user_id', userId),
    countSelf(client, 'participations', 'user_id', userId),
    countSelf(client, 'votes', 'user_id', userId),
    countSelf(client, 'posts', 'author_id', userId),
  ]);
  const firstError = results.find((r) => r.error !== null)?.error ?? null;
  if (firstError) {
    return { data: null, error: firstError };
  }
  const [signatures, participations, votes, posts] = results;
  return {
    data: {
      signatures: signatures?.count ?? 0,
      participations: participations?.count ?? 0,
      votes: votes?.count ?? 0,
      posts: posts?.count ?? 0,
    },
    error: null,
  };
}

export type ProfileActivityKind = 'signature' | 'participation' | 'vote' | 'post';

export interface ProfileActivityItem {
  kind: ProfileActivityKind;
  id: string;
  createdAt: string;
  /** Slug pour le lien de détail (null pour les posts qui n'ont pas de slug). */
  slug: string | null;
  /** Libellé d'affichage : titre, question, ou extrait. */
  label: string;
}

export interface ProfileActivityResult {
  data: ProfileActivityItem[] | null;
  error: PostgrestError | null;
}

interface Embedded {
  title?: string | null;
  slug?: string | null;
  question?: string | null;
}

// PostgREST embed retourne tantôt un objet (FK 1-to-1), tantôt un tableau (FK 1-to-N).
// On accepte les deux formes pour rester robuste aux variations de relation.
function pickEmbedded(value: unknown): Embedded | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    return (value[0] as Embedded | undefined) ?? null;
  }
  if (typeof value === 'object') {
    return value as Embedded;
  }
  return null;
}

function excerpt(raw: string, max = 80): string {
  const trimmed = raw.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

/**
 * Charge les 10 dernières actions de l'utilisateur courant (signatures,
 * RSVP, votes, posts). Les quatre tables sont lues en parallèle ; le tri
 * desc final est fait côté JS sur le merge.
 */
export async function fetchProfileActivity(
  userId: string,
  limit = 10,
  client: Client = supabase,
): Promise<ProfileActivityResult> {
  const [signatures, participations, votes, posts] = await Promise.all([
    client
      .from('signatures')
      .select('id, created_at, petitions(title, slug)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit),
    client
      .from('participations')
      .select('id, created_at, mobilizations(title, slug)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit),
    client
      .from('votes')
      .select('id, created_at, polls(question, slug)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit),
    client
      .from('posts')
      .select('id, created_at, body')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit),
  ]);

  const firstError =
    signatures.error ?? participations.error ?? votes.error ?? posts.error ?? null;
  if (firstError) {
    return { data: null, error: firstError };
  }

  const items: ProfileActivityItem[] = [];

  for (const row of signatures.data ?? []) {
    const rel = pickEmbedded((row as { petitions?: unknown }).petitions);
    items.push({
      kind: 'signature',
      id: row.id,
      createdAt: row.created_at,
      slug: rel?.slug ?? null,
      label: rel?.title ?? 'Pétition',
    });
  }
  for (const row of participations.data ?? []) {
    const rel = pickEmbedded((row as { mobilizations?: unknown }).mobilizations);
    items.push({
      kind: 'participation',
      id: row.id,
      createdAt: row.created_at,
      slug: rel?.slug ?? null,
      label: rel?.title ?? 'Mobilisation',
    });
  }
  for (const row of votes.data ?? []) {
    const rel = pickEmbedded((row as { polls?: unknown }).polls);
    items.push({
      kind: 'vote',
      id: row.id,
      createdAt: row.created_at,
      slug: rel?.slug ?? null,
      label: rel?.question ?? 'Sondage',
    });
  }
  for (const row of posts.data ?? []) {
    const body = (row as { body?: string | null }).body ?? '';
    items.push({
      kind: 'post',
      id: row.id,
      createdAt: row.created_at,
      slug: null,
      label: body ? excerpt(body) : 'Publication',
    });
  }

  items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return { data: items.slice(0, limit), error: null };
}
