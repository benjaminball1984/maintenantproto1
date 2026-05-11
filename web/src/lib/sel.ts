import { PostgrestError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type SelOfferRow = Database['public']['Tables']['sel_offers']['Row'];
export type SelOfferInsert = Database['public']['Tables']['sel_offers']['Insert'];

/** Validation des champs (cf. HANDOFF §10 Sprint 3). */
export const SEL_TITLE_MIN = 4;
export const SEL_TITLE_MAX = 80;
export const SEL_DESCRIPTION_MAX = 2000;
export const SEL_CITY_MIN = 2;
export const SEL_CITY_MAX = 80;
export const SEL_CATEGORY_MIN = 2;
export const SEL_CATEGORY_MAX = 40;
export const SEL_RATE_MIN = 0;
export const SEL_RATE_MAX = 1000;

export interface ListSelParams {
  city?: string | undefined;
  category?: string | undefined;
  search?: string | undefined;
  limit?: number | undefined;
}

export interface ListSelResult {
  data: SelOfferRow[];
  error: PostgrestError | null;
}

export interface SelOfferResult {
  data: SelOfferRow | null;
  error: PostgrestError | null;
}

export interface CreateSelInput {
  userId: string;
  title: string;
  description?: string | null | undefined;
  category: string;
  city: string;
  t99cpRate?: number | undefined;
  isActive?: boolean | undefined;
}

export type CreateSelField = 'title' | 'description' | 'category' | 'city' | 't99cpRate';

export interface ValidationIssue {
  field: CreateSelField;
  message: string;
}

export function validateSelInput(input: CreateSelInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const title = input.title.trim();
  if (title.length < SEL_TITLE_MIN || title.length > SEL_TITLE_MAX) {
    issues.push({
      field: 'title',
      message: `Le titre doit faire entre ${SEL_TITLE_MIN} et ${SEL_TITLE_MAX} caractères.`,
    });
  }
  const description = input.description?.trim() ?? '';
  if (description.length > SEL_DESCRIPTION_MAX) {
    issues.push({
      field: 'description',
      message: `La description ne peut dépasser ${SEL_DESCRIPTION_MAX} caractères.`,
    });
  }
  const category = input.category.trim();
  if (category.length < SEL_CATEGORY_MIN || category.length > SEL_CATEGORY_MAX) {
    issues.push({
      field: 'category',
      message: `La catégorie doit faire entre ${SEL_CATEGORY_MIN} et ${SEL_CATEGORY_MAX} caractères.`,
    });
  }
  const city = input.city.trim();
  if (city.length < SEL_CITY_MIN || city.length > SEL_CITY_MAX) {
    issues.push({
      field: 'city',
      message: `La ville doit faire entre ${SEL_CITY_MIN} et ${SEL_CITY_MAX} caractères.`,
    });
  }
  const rate = input.t99cpRate ?? 1;
  if (!Number.isInteger(rate) || rate < SEL_RATE_MIN || rate > SEL_RATE_MAX) {
    issues.push({
      field: 't99cpRate',
      message: `Le tarif T99CP doit être un entier entre ${SEL_RATE_MIN} et ${SEL_RATE_MAX}.`,
    });
  }
  return issues;
}

/**
 * Liste les offres SEL actives. Tri par `created_at DESC`. Filtres `city`,
 * `category` et `search` (sur title, city, category, description).
 */
export async function listSel(params: ListSelParams = {}): Promise<ListSelResult> {
  const limit = params.limit ?? 50;
  let query = supabase
    .from('sel_offers')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (params.city) {
    query = query.ilike('city', params.city);
  }
  if (params.category) {
    query = query.ilike('category', params.category);
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

/** Lit une offre SEL par ID. */
export async function getSelOffer(id: string): Promise<SelOfferResult> {
  const { data, error } = await supabase
    .from('sel_offers')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return { data, error };
}

/** Crée une offre SEL. RLS impose `auth.uid() = user_id`. */
export async function createSelOffer(input: CreateSelInput): Promise<SelOfferResult> {
  const issues = validateSelInput(input);
  if (issues.length > 0) {
    return {
      data: null,
      error: new PostgrestError({
        message: issues.map((i) => i.message).join(' '),
        details: '',
        hint: issues[0]?.field ?? '',
        code: 'SEL_VALIDATION',
      }),
    };
  }
  const description = input.description?.trim();
  const insert: SelOfferInsert = {
    user_id: input.userId,
    title: input.title.trim(),
    description: description ? description : null,
    category: input.category.trim(),
    city: input.city.trim(),
    t99cp_rate: input.t99cpRate ?? 1,
    is_active: input.isActive ?? true,
  };
  const { data, error } = await supabase
    .from('sel_offers')
    .insert(insert)
    .select('*')
    .maybeSingle();
  return { data, error };
}
