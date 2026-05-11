import { PostgrestError } from '@supabase/supabase-js';

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
