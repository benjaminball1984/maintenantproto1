import { PostgrestError } from '@supabase/supabase-js';

import { slugify } from '@/lib/slug';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type CommuneRow = Database['public']['Tables']['communes']['Row'];
export type CommuneInsert = Database['public']['Tables']['communes']['Insert'];
export type CommuneMemberRow = Database['public']['Tables']['commune_members']['Row'];
export type CommuneMemberInsert = Database['public']['Tables']['commune_members']['Insert'];
export type CommuneMemberRole = 'member' | 'referent' | 'treasurer' | 'admin';

const MEMBER_ROLES: readonly CommuneMemberRole[] = [
  'member',
  'referent',
  'treasurer',
  'admin',
];

/** Validation des champs (cf. HANDOFF §10 Sprint 5). */
export const COMMUNE_NAME_MIN = 3;
export const COMMUNE_NAME_MAX = 80;
export const COMMUNE_CITY_MIN = 2;
export const COMMUNE_CITY_MAX = 80;
export const COMMUNE_DESCRIPTION_MAX = 2000;

export interface ListCommunesParams {
  search?: string | undefined;
  city?: string | undefined;
  limit?: number | undefined;
}

export interface ListCommunesResult {
  data: CommuneRow[];
  error: PostgrestError | null;
}

export interface CommuneResult {
  data: CommuneRow | null;
  error: PostgrestError | null;
}

export interface CommuneMemberResult {
  data: CommuneMemberRow | null;
  error: PostgrestError | null;
}

export interface CommuneMemberListResult {
  data: CommuneMemberRow[];
  error: PostgrestError | null;
}

export interface CreateCommuneInput {
  name: string;
  city: string;
  description?: string | null | undefined;
  treasurerId?: string | null | undefined;
}

export type CreateCommuneField = 'name' | 'city' | 'description' | 'treasurerId';

export interface CommuneValidationIssue {
  field: CreateCommuneField;
  message: string;
}

export function validateCommuneInput(input: CreateCommuneInput): CommuneValidationIssue[] {
  const issues: CommuneValidationIssue[] = [];
  const name = input.name.trim();
  if (name.length < COMMUNE_NAME_MIN || name.length > COMMUNE_NAME_MAX) {
    issues.push({
      field: 'name',
      message: `Le nom doit faire entre ${COMMUNE_NAME_MIN} et ${COMMUNE_NAME_MAX} caractères.`,
    });
  }
  const city = input.city.trim();
  if (city.length < COMMUNE_CITY_MIN || city.length > COMMUNE_CITY_MAX) {
    issues.push({
      field: 'city',
      message: `La ville doit faire entre ${COMMUNE_CITY_MIN} et ${COMMUNE_CITY_MAX} caractères.`,
    });
  }
  const description = input.description?.trim() ?? '';
  if (description.length > COMMUNE_DESCRIPTION_MAX) {
    issues.push({
      field: 'description',
      message: `La description ne peut pas dépasser ${COMMUNE_DESCRIPTION_MAX} caractères.`,
    });
  }
  return issues;
}

/**
 * Liste les communes (lecture publique : policy `communes_select_public`).
 * Tri `created_at DESC`. Filtre `search` cible `name`, `city`, `description`.
 */
export async function listCommunes(
  params: ListCommunesParams = {},
): Promise<ListCommunesResult> {
  const limit = params.limit ?? 100;
  let query = supabase
    .from('communes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (params.city) {
    query = query.eq('city', params.city);
  }
  const search = params.search?.trim();
  if (search) {
    const escaped = search.replace(/[%_,]/g, (m) => `\\${m}`);
    query = query.or(
      `name.ilike.%${escaped}%,city.ilike.%${escaped}%,description.ilike.%${escaped}%`,
    );
  }
  const { data, error } = await query;
  return { data: data ?? [], error };
}

/** Lit une commune par slug (URLs `/communes/:slug`). */
export async function getCommuneBySlug(slug: string): Promise<CommuneResult> {
  const { data, error } = await supabase
    .from('communes')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  return { data, error };
}

/**
 * Crée une commune. RLS impose `public.is_admin(auth.uid())` (cf. policy
 * `communes_write_admin`). Le slug est unique : on retente sur 23505 avec un
 * suffixe numérique, comme pour `articles` et `campaigns`.
 */
export async function createCommune(input: CreateCommuneInput): Promise<CommuneResult> {
  const issues = validateCommuneInput(input);
  if (issues.length > 0) {
    return {
      data: null,
      error: new PostgrestError({
        message: issues.map((i) => i.message).join(' '),
        details: '',
        hint: issues[0]?.field ?? '',
        code: 'COMMUNE_VALIDATION',
      }),
    };
  }
  const description = input.description?.trim();
  const treasurerId = input.treasurerId?.trim();
  const baseSlug = slugify(input.name) || 'commune';
  let attempt = 0;
  while (attempt < 5) {
    const suffix = attempt === 0 ? '' : `-${attempt + 1}`;
    const slug = `${baseSlug}${suffix}`.slice(0, 120);
    const insert: CommuneInsert = {
      name: input.name.trim(),
      slug,
      city: input.city.trim(),
      description: description ? description : null,
      treasurer_id: treasurerId ? treasurerId : null,
    };
    const { data, error } = await supabase
      .from('communes')
      .insert(insert)
      .select('*')
      .maybeSingle();
    if (!error && data) {
      return { data, error: null };
    }
    if (error?.code === '23505') {
      attempt += 1;
      continue;
    }
    return { data: null, error: error ?? null };
  }
  return {
    data: null,
    error: new PostgrestError({
      message: 'Impossible de générer un slug unique. Modifiez le nom.',
      details: '',
      hint: '',
      code: 'COMMUNE_SLUG_COLLISION',
    }),
  };
}

/** Liste les membres d'une commune (lecture publique). */
export async function listCommuneMembers(
  communeId: string,
): Promise<CommuneMemberListResult> {
  const { data, error } = await supabase
    .from('commune_members')
    .select('*')
    .eq('commune_id', communeId)
    .order('joined_at', { ascending: true });
  return { data: data ?? [], error };
}

/**
 * Vérifie si `userId` est membre de la commune. Renvoie la ligne `commune_members`
 * ou `null` si aucun lien n'existe.
 */
export async function getCommuneMembership(
  communeId: string,
  userId: string,
): Promise<CommuneMemberResult> {
  const { data, error } = await supabase
    .from('commune_members')
    .select('*')
    .eq('commune_id', communeId)
    .eq('user_id', userId)
    .maybeSingle();
  return { data, error };
}

/**
 * Rejoint une commune. RLS impose `auth.uid() = user_id` (policy
 * `commune_members_join_self`). Le rôle par défaut est `member` ; les rôles
 * privilégiés sont gérés par le trésorier / admin.
 */
export async function joinCommune(
  communeId: string,
  userId: string,
): Promise<CommuneMemberResult> {
  const insert: CommuneMemberInsert = {
    commune_id: communeId,
    user_id: userId,
    role: 'member',
  };
  const { data, error } = await supabase
    .from('commune_members')
    .insert(insert)
    .select('*')
    .maybeSingle();
  return { data, error };
}

/** Quitte une commune. RLS impose `auth.uid() = user_id` ou admin global. */
export async function leaveCommune(
  communeId: string,
  userId: string,
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('commune_members')
    .delete()
    .eq('commune_id', communeId)
    .eq('user_id', userId);
  return { error };
}

/**
 * Met à jour le rôle d'un membre. RLS impose admin global OU trésorier de
 * la commune (policy `commune_members_update_admin`).
 */
export async function updateCommuneMemberRole(
  memberId: string,
  role: CommuneMemberRole,
): Promise<CommuneMemberResult> {
  if (!MEMBER_ROLES.includes(role)) {
    return {
      data: null,
      error: new PostgrestError({
        message: 'Rôle de membre invalide.',
        details: '',
        hint: 'role',
        code: 'COMMUNE_ROLE_INVALID',
      }),
    };
  }
  const { data, error } = await supabase
    .from('commune_members')
    .update({ role })
    .eq('id', memberId)
    .select('*')
    .maybeSingle();
  return { data, error };
}
