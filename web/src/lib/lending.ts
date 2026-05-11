import { PostgrestError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type LendingRow = Database['public']['Tables']['lending']['Row'];
export type LendingInsert = Database['public']['Tables']['lending']['Insert'];

/** Validation des champs du formulaire de création (cf. HANDOFF §10 Sprint 3). */
export const LENDING_TITLE_MIN = 4;
export const LENDING_TITLE_MAX = 80;
export const LENDING_DESCRIPTION_MAX = 2000;
export const LENDING_CITY_MIN = 2;
export const LENDING_CITY_MAX = 80;
export const LENDING_CATEGORY_MIN = 2;
export const LENDING_CATEGORY_MAX = 40;
export const LENDING_T99CP_MIN = 0;
export const LENDING_T99CP_MAX = 10000;

export interface ListLendingParams {
  city?: string | undefined;
  category?: string | undefined;
  search?: string | undefined;
  maxCost?: number | undefined;
  limit?: number | undefined;
}

export interface ListLendingResult {
  data: LendingRow[];
  error: PostgrestError | null;
}

export interface LendingResult {
  data: LendingRow | null;
  error: PostgrestError | null;
}

export interface CreateLendingInput {
  ownerId: string;
  title: string;
  description?: string | null | undefined;
  category: string;
  city: string;
  t99cpCost?: number | undefined;
  isAvailable?: boolean | undefined;
}

export type CreateLendingField =
  | 'title'
  | 'description'
  | 'category'
  | 'city'
  | 't99cpCost';

export interface ValidationIssue {
  field: CreateLendingField;
  message: string;
}

/** Valide l'input avant insertion. Retourne `[]` si tout est OK. */
export function validateLendingInput(input: CreateLendingInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const title = input.title.trim();
  if (title.length < LENDING_TITLE_MIN || title.length > LENDING_TITLE_MAX) {
    issues.push({
      field: 'title',
      message: `Le titre doit faire entre ${LENDING_TITLE_MIN} et ${LENDING_TITLE_MAX} caractères.`,
    });
  }
  const description = input.description?.trim() ?? '';
  if (description.length > LENDING_DESCRIPTION_MAX) {
    issues.push({
      field: 'description',
      message: `La description ne peut dépasser ${LENDING_DESCRIPTION_MAX} caractères.`,
    });
  }
  const category = input.category.trim();
  if (category.length < LENDING_CATEGORY_MIN || category.length > LENDING_CATEGORY_MAX) {
    issues.push({
      field: 'category',
      message: `La catégorie doit faire entre ${LENDING_CATEGORY_MIN} et ${LENDING_CATEGORY_MAX} caractères.`,
    });
  }
  const city = input.city.trim();
  if (city.length < LENDING_CITY_MIN || city.length > LENDING_CITY_MAX) {
    issues.push({
      field: 'city',
      message: `La ville doit faire entre ${LENDING_CITY_MIN} et ${LENDING_CITY_MAX} caractères.`,
    });
  }
  const cost = input.t99cpCost ?? 0;
  if (
    !Number.isInteger(cost) ||
    cost < LENDING_T99CP_MIN ||
    cost > LENDING_T99CP_MAX
  ) {
    issues.push({
      field: 't99cpCost',
      message: `Le coût en T99CP doit être un entier entre ${LENDING_T99CP_MIN} et ${LENDING_T99CP_MAX}.`,
    });
  }
  return issues;
}

/**
 * Liste les annonces de prêt disponibles (`is_available=true` par défaut). Tri
 * par `created_at DESC`. Le filtre `search` est appliqué côté Postgres via
 * `ilike` sur `title`, `city`, `description` et `category` avec échappement
 * des méta-caractères %, _ et ,.
 */
export async function listLending(params: ListLendingParams = {}): Promise<ListLendingResult> {
  const limit = params.limit ?? 50;
  let query = supabase
    .from('lending')
    .select('*')
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (params.city) {
    query = query.ilike('city', params.city);
  }
  if (params.category) {
    query = query.ilike('category', params.category);
  }
  if (typeof params.maxCost === 'number' && Number.isFinite(params.maxCost)) {
    query = query.lte('t99cp_cost', params.maxCost);
  }

  const search = params.search?.trim();
  if (search) {
    const escaped = search.replace(/[%_,]/g, (m) => `\\${m}`);
    query = query.or(
      `title.ilike.%${escaped}%,city.ilike.%${escaped}%,category.ilike.%${escaped}%,description.ilike.%${escaped}%`,
    );
  }

  const { data, error } = await query;
  return { data: data ?? [], error };
}

/** Lit une annonce de prêt par ID. */
export async function getLending(id: string): Promise<LendingResult> {
  const { data, error } = await supabase.from('lending').select('*').eq('id', id).maybeSingle();
  return { data, error };
}

/**
 * Crée une annonce de prêt. RLS impose `auth.uid() = owner_id`. Pas de slug —
 * fiche accessible par ID.
 */
export async function createLending(input: CreateLendingInput): Promise<LendingResult> {
  const issues = validateLendingInput(input);
  if (issues.length > 0) {
    return {
      data: null,
      error: new PostgrestError({
        message: issues.map((i) => i.message).join(' '),
        details: '',
        hint: issues[0]?.field ?? '',
        code: 'LENDING_VALIDATION',
      }),
    };
  }

  const description = input.description?.trim();
  const insert: LendingInsert = {
    owner_id: input.ownerId,
    title: input.title.trim(),
    description: description ? description : null,
    category: input.category.trim(),
    city: input.city.trim(),
    t99cp_cost: input.t99cpCost ?? 0,
    is_available: input.isAvailable ?? true,
  };
  const { data, error } = await supabase
    .from('lending')
    .insert(insert)
    .select('*')
    .maybeSingle();
  return { data, error };
}
