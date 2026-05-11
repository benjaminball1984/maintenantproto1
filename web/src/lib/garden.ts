import { PostgrestError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type GardenPlotRow = Database['public']['Tables']['garden_plots']['Row'];
export type GardenPlotInsert = Database['public']['Tables']['garden_plots']['Insert'];

/** Validation des champs (cf. HANDOFF §10 Sprint 3). */
export const GARDEN_NAME_MIN = 4;
export const GARDEN_NAME_MAX = 80;
export const GARDEN_DESCRIPTION_MAX = 2000;
export const GARDEN_CITY_MIN = 2;
export const GARDEN_CITY_MAX = 80;
export const GARDEN_SIZE_MIN = 1;
export const GARDEN_SIZE_MAX = 100000;
export const GARDEN_SPOTS_MIN = 0;
export const GARDEN_SPOTS_MAX = 1000;

export interface ListGardenParams {
  city?: string | undefined;
  search?: string | undefined;
  withSpots?: boolean | undefined;
  limit?: number | undefined;
}

export interface ListGardenResult {
  data: GardenPlotRow[];
  error: PostgrestError | null;
}

export interface GardenPlotResult {
  data: GardenPlotRow | null;
  error: PostgrestError | null;
}

export interface CreateGardenInput {
  managerId: string;
  name: string;
  description?: string | null | undefined;
  city: string;
  sizeSqm?: number | null | undefined;
  availableSpots?: number | undefined;
}

export type CreateGardenField =
  | 'name'
  | 'description'
  | 'city'
  | 'sizeSqm'
  | 'availableSpots';

export interface ValidationIssue {
  field: CreateGardenField;
  message: string;
}

export function validateGardenInput(input: CreateGardenInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const name = input.name.trim();
  if (name.length < GARDEN_NAME_MIN || name.length > GARDEN_NAME_MAX) {
    issues.push({
      field: 'name',
      message: `Le nom doit faire entre ${GARDEN_NAME_MIN} et ${GARDEN_NAME_MAX} caractères.`,
    });
  }
  const description = input.description?.trim() ?? '';
  if (description.length > GARDEN_DESCRIPTION_MAX) {
    issues.push({
      field: 'description',
      message: `La description ne peut dépasser ${GARDEN_DESCRIPTION_MAX} caractères.`,
    });
  }
  const city = input.city.trim();
  if (city.length < GARDEN_CITY_MIN || city.length > GARDEN_CITY_MAX) {
    issues.push({
      field: 'city',
      message: `La ville doit faire entre ${GARDEN_CITY_MIN} et ${GARDEN_CITY_MAX} caractères.`,
    });
  }
  const sizeProvided =
    input.sizeSqm !== null && input.sizeSqm !== undefined && Number.isFinite(input.sizeSqm);
  if (sizeProvided) {
    const size = input.sizeSqm as number;
    if (!Number.isInteger(size) || size < GARDEN_SIZE_MIN || size > GARDEN_SIZE_MAX) {
      issues.push({
        field: 'sizeSqm',
        message: `La surface doit être un entier entre ${GARDEN_SIZE_MIN} et ${GARDEN_SIZE_MAX} m².`,
      });
    }
  }
  const spots = input.availableSpots ?? 0;
  if (!Number.isInteger(spots) || spots < GARDEN_SPOTS_MIN || spots > GARDEN_SPOTS_MAX) {
    issues.push({
      field: 'availableSpots',
      message: `Le nombre de parcelles libres doit être un entier entre ${GARDEN_SPOTS_MIN} et ${GARDEN_SPOTS_MAX}.`,
    });
  }
  return issues;
}

/**
 * Liste les jardins partagés. Tri par `created_at DESC`. Filtre `withSpots`
 * cible `available_spots > 0`. Le filtre `search` cible `name`, `city` et
 * `description` avec échappement des méta-caractères.
 */
export async function listGarden(params: ListGardenParams = {}): Promise<ListGardenResult> {
  const limit = params.limit ?? 50;
  let query = supabase
    .from('garden_plots')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (params.city) {
    query = query.ilike('city', params.city);
  }
  if (params.withSpots) {
    query = query.gt('available_spots', 0);
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

/** Lit un jardin par ID. */
export async function getGarden(id: string): Promise<GardenPlotResult> {
  const { data, error } = await supabase
    .from('garden_plots')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return { data, error };
}

/** Crée un jardin partagé. RLS impose `auth.uid() = manager_id`. */
export async function createGarden(input: CreateGardenInput): Promise<GardenPlotResult> {
  const issues = validateGardenInput(input);
  if (issues.length > 0) {
    return {
      data: null,
      error: new PostgrestError({
        message: issues.map((i) => i.message).join(' '),
        details: '',
        hint: issues[0]?.field ?? '',
        code: 'GARDEN_VALIDATION',
      }),
    };
  }
  const description = input.description?.trim();
  const sizeProvided =
    input.sizeSqm !== null && input.sizeSqm !== undefined && Number.isFinite(input.sizeSqm);
  const insert: GardenPlotInsert = {
    manager_id: input.managerId,
    name: input.name.trim(),
    description: description ? description : null,
    city: input.city.trim(),
    size_sqm: sizeProvided ? (input.sizeSqm as number) : null,
    available_spots: input.availableSpots ?? 0,
  };
  const { data, error } = await supabase
    .from('garden_plots')
    .insert(insert)
    .select('*')
    .maybeSingle();
  return { data, error };
}
