import { PostgrestError } from '@supabase/supabase-js';

import { slugify } from '@/lib/slug';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export { slugify };

export type PetitionRow = Database['public']['Tables']['petitions']['Row'];
export type PetitionInsert = Database['public']['Tables']['petitions']['Insert'];
export type PetitionStatus = Database['public']['Enums']['content_status'];
export type SignatureRow = Database['public']['Tables']['signatures']['Row'];

/** Validation des champs du formulaire de création (cf. HANDOFF §10 sprint 2). */
export const PETITION_TITLE_MIN = 8;
export const PETITION_TITLE_MAX = 80;
export const PETITION_SUMMARY_MIN = 40;
export const PETITION_SUMMARY_MAX = 240;
export const PETITION_BODY_MIN = 200;
export const PETITION_TARGET_MIN = 100;
export const PETITION_TARGET_MAX = 1_000_000;

/** Catégories autorisées — alignées sur le prototype Pages_Services.jsx. */
export const PETITION_CATEGORIES: readonly string[] = [
  'Santé',
  'Écologie',
  'Démocratie',
  'Économie',
  'Solidarité',
  'Social',
  'Justice',
  'Transport',
  'Logement',
  'Droits',
  'Éducation',
  'Autre',
];

export interface ListPetitionsParams {
  status?: PetitionStatus | undefined;
  search?: string | undefined;
  category?: string | undefined;
  limit?: number | undefined;
}

export interface ListPetitionsResult {
  data: PetitionRow[];
  error: PostgrestError | null;
}

export interface PetitionResult {
  data: PetitionRow | null;
  error: PostgrestError | null;
}

export interface SignatureResult {
  data: SignatureRow | null;
  error: PostgrestError | null;
}

export interface VoidResult {
  error: PostgrestError | null;
}

export interface HasSignedResult {
  signed: boolean;
  error: PostgrestError | null;
}

export interface CreatePetitionInput {
  authorId: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  targetCount?: number | undefined;
  coverUrl?: string | null | undefined;
}

export interface ValidationIssue {
  field: keyof CreatePetitionInput;
  message: string;
}

/** Valide l'input avant insertion. Retourne `[]` si tout est OK. */
export function validatePetitionInput(input: CreatePetitionInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const title = input.title.trim();
  if (title.length < PETITION_TITLE_MIN || title.length > PETITION_TITLE_MAX) {
    issues.push({
      field: 'title',
      message: `Le titre doit faire entre ${PETITION_TITLE_MIN} et ${PETITION_TITLE_MAX} caractères.`,
    });
  }
  const summary = input.summary.trim();
  if (summary.length < PETITION_SUMMARY_MIN || summary.length > PETITION_SUMMARY_MAX) {
    issues.push({
      field: 'summary',
      message: `Le résumé doit faire entre ${PETITION_SUMMARY_MIN} et ${PETITION_SUMMARY_MAX} caractères.`,
    });
  }
  if (input.body.trim().length < PETITION_BODY_MIN) {
    issues.push({
      field: 'body',
      message: `La présentation détaillée doit faire au moins ${PETITION_BODY_MIN} caractères.`,
    });
  }
  if (!PETITION_CATEGORIES.includes(input.category)) {
    issues.push({ field: 'category', message: 'Catégorie inconnue.' });
  }
  if (input.targetCount !== undefined) {
    if (
      !Number.isFinite(input.targetCount) ||
      input.targetCount < PETITION_TARGET_MIN ||
      input.targetCount > PETITION_TARGET_MAX
    ) {
      issues.push({
        field: 'targetCount',
        message: `L'objectif doit être compris entre ${PETITION_TARGET_MIN} et ${PETITION_TARGET_MAX} signatures.`,
      });
    }
  }
  return issues;
}

/**
 * Liste les pétitions publiques (status='published' par défaut). Toutes les
 * colonnes sont remontées (compteur dénormalisé inclus).
 *
 * `search` est appliqué côté Postgres via `ilike` sur le titre puis sur le
 * résumé — pour gros volume on basculera sur Postgres full-text plus tard.
 */
export async function listPetitions(
  params: ListPetitionsParams = {},
): Promise<ListPetitionsResult> {
  const status: PetitionStatus = params.status ?? 'published';
  const limit = params.limit ?? 50;

  let query = supabase
    .from('petitions')
    .select('*')
    .eq('status', status)
    .order('signature_count', { ascending: false })
    .limit(limit);

  if (params.category) {
    query = query.eq('category', params.category);
  }

  const search = params.search?.trim();
  if (search) {
    const escaped = search.replace(/[%_,]/g, (m) => `\\${m}`);
    query = query.or(`title.ilike.%${escaped}%,summary.ilike.%${escaped}%`);
  }

  const { data, error } = await query;
  return { data: data ?? [], error };
}

/**
 * Lit une pétition par slug (route `/petitions/:slug`). Renvoie data: null si
 * absente — l'appelant rend alors une 404. On laisse Postgrest renvoyer
 * `PGRST116` quand on demande explicitement `.single()`, ici on préfère
 * `maybeSingle()` pour rester silencieux sur un vrai 404.
 */
export async function getPetition(slug: string): Promise<PetitionResult> {
  const { data, error } = await supabase
    .from('petitions')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  return { data, error };
}

/**
 * Tente de créer une pétition avec un slug unique. En cas de collision (code
 * 23505 sur la contrainte `petitions_slug_key`), retente avec un suffixe
 * incrémental, jusqu'à 5 fois.
 */
export async function createPetition(input: CreatePetitionInput): Promise<PetitionResult> {
  const issues = validatePetitionInput(input);
  if (issues.length > 0) {
    return {
      data: null,
      error: new PostgrestError({
        message: issues.map((i) => i.message).join(' '),
        details: '',
        hint: issues[0]?.field ?? '',
        code: 'PETITION_VALIDATION',
      }),
    };
  }

  const baseSlug = slugify(input.title) || 'petition';
  let attempt = 0;
  while (attempt < 5) {
    const suffix = attempt === 0 ? '' : `-${attempt + 1}`;
    const slug = `${baseSlug}${suffix}`.slice(0, 80);
    const insert: PetitionInsert = {
      author_id: input.authorId,
      title: input.title.trim(),
      slug,
      summary: input.summary.trim(),
      body: input.body.trim(),
      category: input.category,
      target_count: input.targetCount ?? 1000,
      cover_url: input.coverUrl ?? null,
      status: 'published',
    };
    const { data, error } = await supabase
      .from('petitions')
      .insert(insert)
      .select('*')
      .maybeSingle();
    if (!error) {
      return { data, error: null };
    }
    if (error.code === '23505') {
      attempt += 1;
      continue;
    }
    return { data: null, error };
  }
  return {
    data: null,
    error: new PostgrestError({
      message: 'Impossible de générer un slug unique. Modifiez le titre.',
      details: '',
      hint: '',
      code: 'PETITION_SLUG_COLLISION',
    }),
  };
}

/**
 * Insère une signature pour l'utilisateur courant. La policy RLS
 * `signatures_insert_self` vérifie `auth.uid() = user_id`, et la contrainte
 * UNIQUE `(petition_id, user_id)` empêche les doublons. Le trigger
 * `signatures_count_inc` met automatiquement à jour `petitions.signature_count`.
 */
export async function signPetition(petitionId: string, userId: string): Promise<SignatureResult> {
  const { data, error } = await supabase
    .from('signatures')
    .insert({ petition_id: petitionId, user_id: userId })
    .select('*')
    .maybeSingle();
  return { data, error };
}

/** Retire la signature de l'utilisateur courant (RGPD : retrait de consentement). */
export async function unsignPetition(petitionId: string, userId: string): Promise<VoidResult> {
  const { error } = await supabase
    .from('signatures')
    .delete()
    .eq('petition_id', petitionId)
    .eq('user_id', userId);
  return { error };
}

/** Vrai si l'utilisateur a déjà signé la pétition. */
export async function hasUserSigned(petitionId: string, userId: string): Promise<HasSignedResult> {
  const { data, error } = await supabase
    .from('signatures')
    .select('id')
    .eq('petition_id', petitionId)
    .eq('user_id', userId)
    .maybeSingle();
  return { signed: Boolean(data), error };
}

/** Liste les signatures d'une pétition (utilisé pour la liste publique anonymisée). */
export async function listPetitionSignatures(
  petitionId: string,
  limit = 20,
): Promise<{ data: SignatureRow[]; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('signatures')
    .select('*')
    .eq('petition_id', petitionId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data: data ?? [], error };
}

/**
 * Renvoie le compteur de signatures pour une pétition via la RPC publique
 * `signatures_count_for_petition` (étape 24 — dette M2-sec, scalar SECURITY
 * DEFINER). Cette RPC ne projette **aucun** `user_id`, contrairement à
 * `select * from signatures where petition_id = ...`. Elle est destinée à
 * remplacer les lectures de `signatures` côté anonymes une fois la policy
 * `signatures_select_public` durcie (étape RLS hardening dédiée — demande
 * validation explicite côté produit / DPO car c'est un changement de
 * policy existante visible côté client).
 *
 * En attendant le durcissement, la RPC est livrée en additif (sans
 * impact sur les flows existants) pour que les nouveaux call-sites
 * convergent dessus.
 */
export async function getPetitionSignatureCount(
  petitionId: string,
): Promise<{ count: number | null; error: PostgrestError | null }> {
  const { data, error } = await supabase.rpc('signatures_count_for_petition', {
    p_petition: petitionId,
  });
  if (error) return { count: null, error };
  // La RPC renvoie un scalar `integer`. PostgREST sérialise les scalaires de
  // RPC comme une primitive — `data` est donc directement un `number`.
  const count = typeof data === 'number' && Number.isFinite(data) ? data : 0;
  return { count, error: null };
}
