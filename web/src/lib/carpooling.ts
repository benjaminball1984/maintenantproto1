import { PostgrestError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type CarpoolingRow = Database['public']['Tables']['carpooling']['Row'];
export type CarpoolingInsert = Database['public']['Tables']['carpooling']['Insert'];

/** Validation des champs (cf. HANDOFF §10 Sprint 3). */
export const CARPOOLING_CITY_MIN = 2;
export const CARPOOLING_CITY_MAX = 80;
export const CARPOOLING_SEATS_MIN = 1;
export const CARPOOLING_SEATS_MAX = 8;
export const CARPOOLING_PRICE_MIN = 0;
export const CARPOOLING_PRICE_MAX = 500;
export const CARPOOLING_NOTES_MAX = 2000;

export interface ListCarpoolingParams {
  from?: string | undefined;
  to?: string | undefined;
  search?: string | undefined;
  departsAfter?: string | undefined;
  departsBefore?: string | undefined;
  limit?: number | undefined;
}

export interface ListCarpoolingResult {
  data: CarpoolingRow[];
  error: PostgrestError | null;
}

export interface CarpoolingResult {
  data: CarpoolingRow | null;
  error: PostgrestError | null;
}

export interface CreateCarpoolingInput {
  driverId: string;
  originCity: string;
  destinationCity: string;
  departsAt: string;
  seats: number;
  priceEur?: number | null | undefined;
  notes?: string | null | undefined;
  isPublished?: boolean | undefined;
}

export type CreateCarpoolingField =
  | 'originCity'
  | 'destinationCity'
  | 'departsAt'
  | 'seats'
  | 'priceEur'
  | 'notes';

export interface ValidationIssue {
  field: CreateCarpoolingField;
  message: string;
}

/** Valide l'input avant insertion. Retourne `[]` si tout est OK. */
export function validateCarpoolingInput(input: CreateCarpoolingInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const origin = input.originCity.trim();
  if (origin.length < CARPOOLING_CITY_MIN || origin.length > CARPOOLING_CITY_MAX) {
    issues.push({
      field: 'originCity',
      message: `Le départ doit faire entre ${CARPOOLING_CITY_MIN} et ${CARPOOLING_CITY_MAX} caractères.`,
    });
  }
  const destination = input.destinationCity.trim();
  if (destination.length < CARPOOLING_CITY_MIN || destination.length > CARPOOLING_CITY_MAX) {
    issues.push({
      field: 'destinationCity',
      message: `L’arrivée doit faire entre ${CARPOOLING_CITY_MIN} et ${CARPOOLING_CITY_MAX} caractères.`,
    });
  }
  const departsTime = Date.parse(input.departsAt);
  if (Number.isNaN(departsTime)) {
    issues.push({ field: 'departsAt', message: 'Date de départ invalide.' });
  } else if (departsTime <= Date.now()) {
    issues.push({
      field: 'departsAt',
      message: 'La date de départ doit être située dans le futur.',
    });
  }
  if (
    !Number.isInteger(input.seats) ||
    input.seats < CARPOOLING_SEATS_MIN ||
    input.seats > CARPOOLING_SEATS_MAX
  ) {
    issues.push({
      field: 'seats',
      message: `Le nombre de places doit être un entier entre ${CARPOOLING_SEATS_MIN} et ${CARPOOLING_SEATS_MAX}.`,
    });
  }
  const price = input.priceEur ?? 0;
  if (typeof price !== 'number' || !Number.isFinite(price) || price < CARPOOLING_PRICE_MIN) {
    issues.push({
      field: 'priceEur',
      message: 'Le tarif doit être un nombre positif (0 € si gratuit).',
    });
  } else if (price > CARPOOLING_PRICE_MAX) {
    issues.push({
      field: 'priceEur',
      message: `Le tarif maximum est ${CARPOOLING_PRICE_MAX} €.`,
    });
  }
  const notes = input.notes?.trim() ?? '';
  if (notes.length > CARPOOLING_NOTES_MAX) {
    issues.push({
      field: 'notes',
      message: `Les notes ne peuvent dépasser ${CARPOOLING_NOTES_MAX} caractères.`,
    });
  }
  return issues;
}

/**
 * Liste les annonces de covoiturage publiques (`is_published=true` par défaut).
 * Tri par `departs_at` ASC pour afficher les trajets à venir en premier.
 *
 * Le filtre `search` cible `origin_city`, `destination_city` et `notes` via
 * `ilike` avec échappement des méta-caractères.
 */
export async function listCarpooling(
  params: ListCarpoolingParams = {},
): Promise<ListCarpoolingResult> {
  const limit = params.limit ?? 50;
  let query = supabase
    .from('carpooling')
    .select('*')
    .eq('is_published', true)
    .order('departs_at', { ascending: true })
    .limit(limit);

  if (params.from) {
    query = query.ilike('origin_city', params.from);
  }
  if (params.to) {
    query = query.ilike('destination_city', params.to);
  }
  if (params.departsAfter) {
    query = query.gte('departs_at', params.departsAfter);
  }
  if (params.departsBefore) {
    query = query.lte('departs_at', params.departsBefore);
  }

  const search = params.search?.trim();
  if (search) {
    const escaped = search.replace(/[%_,]/g, (m) => `\\${m}`);
    query = query.or(
      `origin_city.ilike.%${escaped}%,destination_city.ilike.%${escaped}%,notes.ilike.%${escaped}%`,
    );
  }

  const { data, error } = await query;
  return { data: data ?? [], error };
}

/** Lit une annonce de covoiturage par ID. */
export async function getCarpooling(id: string): Promise<CarpoolingResult> {
  const { data, error } = await supabase
    .from('carpooling')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return { data, error };
}

/**
 * Crée une annonce de covoiturage. RLS impose `auth.uid() = driver_id`. Pas
 * de slug — fiche accessible par ID.
 */
export async function createCarpooling(input: CreateCarpoolingInput): Promise<CarpoolingResult> {
  const issues = validateCarpoolingInput(input);
  if (issues.length > 0) {
    return {
      data: null,
      error: new PostgrestError({
        message: issues.map((i) => i.message).join(' '),
        details: '',
        hint: issues[0]?.field ?? '',
        code: 'CARPOOLING_VALIDATION',
      }),
    };
  }

  const notes = input.notes?.trim();
  const insert: CarpoolingInsert = {
    driver_id: input.driverId,
    origin_city: input.originCity.trim(),
    destination_city: input.destinationCity.trim(),
    departs_at: input.departsAt,
    seats: input.seats,
    price_eur: input.priceEur ?? 0,
    notes: notes ? notes : null,
    is_published: input.isPublished ?? true,
  };
  const { data, error } = await supabase
    .from('carpooling')
    .insert(insert)
    .select('*')
    .maybeSingle();
  return { data, error };
}
