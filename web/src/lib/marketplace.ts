import { PostgrestError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type MarketplaceItemRow = Database['public']['Tables']['marketplace_items']['Row'];
export type MarketplaceItemInsert = Database['public']['Tables']['marketplace_items']['Insert'];

/** Validation des champs (cf. HANDOFF §10 Sprint 3). */
export const MARKETPLACE_TITLE_MIN = 4;
export const MARKETPLACE_TITLE_MAX = 80;
export const MARKETPLACE_DESCRIPTION_MAX = 2000;
export const MARKETPLACE_CITY_MIN = 2;
export const MARKETPLACE_CITY_MAX = 80;
export const MARKETPLACE_CATEGORY_MIN = 2;
export const MARKETPLACE_CATEGORY_MAX = 40;
export const MARKETPLACE_PRICE_MIN = 0;
export const MARKETPLACE_PRICE_MAX = 99999;
export const MARKETPLACE_T99CP_MIN = 0;
export const MARKETPLACE_T99CP_MAX = 100000;

export interface ListMarketplaceParams {
  city?: string | undefined;
  category?: string | undefined;
  search?: string | undefined;
  maxPriceEur?: number | undefined;
  limit?: number | undefined;
}

export interface ListMarketplaceResult {
  data: MarketplaceItemRow[];
  error: PostgrestError | null;
}

export interface MarketplaceItemResult {
  data: MarketplaceItemRow | null;
  error: PostgrestError | null;
}

export interface CreateMarketplaceInput {
  sellerId: string;
  title: string;
  description?: string | null | undefined;
  category: string;
  city: string;
  priceEur?: number | null | undefined;
  t99cpCost?: number | null | undefined;
}

export type CreateMarketplaceField =
  | 'title'
  | 'description'
  | 'category'
  | 'city'
  | 'priceEur'
  | 't99cpCost';

export interface ValidationIssue {
  field: CreateMarketplaceField;
  message: string;
}

/**
 * Valide l'input avant insertion. Au moins l'un des deux moyens d'échange
 * (price_eur OU t99cp_cost) doit être renseigné — contrainte CHECK de la
 * table `marketplace_items`.
 */
export function validateMarketplaceInput(input: CreateMarketplaceInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const title = input.title.trim();
  if (title.length < MARKETPLACE_TITLE_MIN || title.length > MARKETPLACE_TITLE_MAX) {
    issues.push({
      field: 'title',
      message: `Le titre doit faire entre ${MARKETPLACE_TITLE_MIN} et ${MARKETPLACE_TITLE_MAX} caractères.`,
    });
  }
  const description = input.description?.trim() ?? '';
  if (description.length > MARKETPLACE_DESCRIPTION_MAX) {
    issues.push({
      field: 'description',
      message: `La description ne peut dépasser ${MARKETPLACE_DESCRIPTION_MAX} caractères.`,
    });
  }
  const category = input.category.trim();
  if (
    category.length < MARKETPLACE_CATEGORY_MIN ||
    category.length > MARKETPLACE_CATEGORY_MAX
  ) {
    issues.push({
      field: 'category',
      message: `La catégorie doit faire entre ${MARKETPLACE_CATEGORY_MIN} et ${MARKETPLACE_CATEGORY_MAX} caractères.`,
    });
  }
  const city = input.city.trim();
  if (city.length < MARKETPLACE_CITY_MIN || city.length > MARKETPLACE_CITY_MAX) {
    issues.push({
      field: 'city',
      message: `La ville doit faire entre ${MARKETPLACE_CITY_MIN} et ${MARKETPLACE_CITY_MAX} caractères.`,
    });
  }

  const priceProvided =
    input.priceEur !== null && input.priceEur !== undefined && Number.isFinite(input.priceEur);
  const t99cpProvided =
    input.t99cpCost !== null && input.t99cpCost !== undefined && Number.isFinite(input.t99cpCost);

  if (!priceProvided && !t99cpProvided) {
    issues.push({
      field: 'priceEur',
      message: 'Renseignez au moins un prix en euros ou un coût en T99CP.',
    });
  }
  if (priceProvided) {
    const price = input.priceEur as number;
    if (price < MARKETPLACE_PRICE_MIN || price > MARKETPLACE_PRICE_MAX) {
      issues.push({
        field: 'priceEur',
        message: `Le prix doit être compris entre ${MARKETPLACE_PRICE_MIN} et ${MARKETPLACE_PRICE_MAX} €.`,
      });
    }
  }
  if (t99cpProvided) {
    const cost = input.t99cpCost as number;
    if (
      !Number.isInteger(cost) ||
      cost < MARKETPLACE_T99CP_MIN ||
      cost > MARKETPLACE_T99CP_MAX
    ) {
      issues.push({
        field: 't99cpCost',
        message: `Le coût T99CP doit être un entier entre ${MARKETPLACE_T99CP_MIN} et ${MARKETPLACE_T99CP_MAX}.`,
      });
    }
  }
  return issues;
}

/**
 * Liste les annonces non vendues (`is_sold=false` par défaut). Tri par
 * `created_at DESC`.
 */
export async function listMarketplace(
  params: ListMarketplaceParams = {},
): Promise<ListMarketplaceResult> {
  const limit = params.limit ?? 50;
  let query = supabase
    .from('marketplace_items')
    .select('*')
    .eq('is_sold', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (params.city) {
    query = query.ilike('city', params.city);
  }
  if (params.category) {
    query = query.ilike('category', params.category);
  }
  if (typeof params.maxPriceEur === 'number' && Number.isFinite(params.maxPriceEur)) {
    query = query.lte('price_eur', params.maxPriceEur);
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

/** Lit une annonce par ID. */
export async function getMarketplaceItem(id: string): Promise<MarketplaceItemResult> {
  const { data, error } = await supabase
    .from('marketplace_items')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return { data, error };
}

/**
 * Crée une annonce marketplace. RLS impose `auth.uid() = seller_id`. Pas de
 * slug — fiche accessible par ID.
 */
export async function createMarketplaceItem(
  input: CreateMarketplaceInput,
): Promise<MarketplaceItemResult> {
  const issues = validateMarketplaceInput(input);
  if (issues.length > 0) {
    return {
      data: null,
      error: new PostgrestError({
        message: issues.map((i) => i.message).join(' '),
        details: '',
        hint: issues[0]?.field ?? '',
        code: 'MARKETPLACE_VALIDATION',
      }),
    };
  }
  const description = input.description?.trim();
  const insert: MarketplaceItemInsert = {
    seller_id: input.sellerId,
    title: input.title.trim(),
    description: description ? description : null,
    category: input.category.trim(),
    city: input.city.trim(),
    price_eur:
      input.priceEur !== null && input.priceEur !== undefined && Number.isFinite(input.priceEur)
        ? input.priceEur
        : null,
    t99cp_cost:
      input.t99cpCost !== null && input.t99cpCost !== undefined && Number.isFinite(input.t99cpCost)
        ? input.t99cpCost
        : null,
  };
  const { data, error } = await supabase
    .from('marketplace_items')
    .insert(insert)
    .select('*')
    .maybeSingle();
  return { data, error };
}
