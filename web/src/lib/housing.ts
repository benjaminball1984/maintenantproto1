import { PostgrestError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type HousingRow = Database['public']['Tables']['housing']['Row'];
export type HousingInsert = Database['public']['Tables']['housing']['Insert'];
export type HousingRequestRow = Database['public']['Tables']['housing_requests']['Row'];
export type HousingRequestInsert = Database['public']['Tables']['housing_requests']['Insert'];
export type HousingRequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

/** Validation des champs du formulaire de création (cf. HANDOFF §10 Sprint 3). */
export const HOUSING_TITLE_MIN = 4;
export const HOUSING_TITLE_MAX = 80;
export const HOUSING_DESCRIPTION_MIN = 40;
export const HOUSING_DESCRIPTION_MAX = 2000;
export const HOUSING_CITY_MIN = 2;
export const HOUSING_CITY_MAX = 80;
export const HOUSING_CAPACITY_MIN = 1;
export const HOUSING_CAPACITY_MAX = 20;
export const HOUSING_REQUEST_MESSAGE_MIN = 20;
export const HOUSING_REQUEST_MESSAGE_MAX = 2000;

export interface ListHousingParams {
  city?: string | undefined;
  search?: string | undefined;
  capacityMin?: number | undefined;
  availableFrom?: string | undefined;
  availableTo?: string | undefined;
  limit?: number | undefined;
}

export interface ListHousingResult {
  data: HousingRow[];
  error: PostgrestError | null;
}

export interface HousingResult {
  data: HousingRow | null;
  error: PostgrestError | null;
}

export interface HousingRequestResult {
  data: HousingRequestRow | null;
  error: PostgrestError | null;
}

export interface VoidResult {
  error: PostgrestError | null;
}

export interface CreateHousingInput {
  hostId: string;
  title: string;
  description: string;
  city: string;
  capacity: number;
  availableFrom?: string | null | undefined;
  availableTo?: string | null | undefined;
  isPublished?: boolean | undefined;
}

export type CreateHousingField =
  | 'title'
  | 'description'
  | 'city'
  | 'capacity'
  | 'availableFrom'
  | 'availableTo';

export interface ValidationIssue {
  field: CreateHousingField;
  message: string;
}

export interface RequestHousingInput {
  housingId: string;
  requesterId: string;
  message: string;
  startsOn: string;
  endsOn: string;
}

export type RequestHousingField = 'message' | 'startsOn' | 'endsOn';

export interface RequestValidationIssue {
  field: RequestHousingField;
  message: string;
}

/** Valide l'input avant insertion d'une annonce. Retourne `[]` si tout est OK. */
export function validateHousingInput(input: CreateHousingInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const title = input.title.trim();
  if (title.length < HOUSING_TITLE_MIN || title.length > HOUSING_TITLE_MAX) {
    issues.push({
      field: 'title',
      message: `Le titre doit faire entre ${HOUSING_TITLE_MIN} et ${HOUSING_TITLE_MAX} caractères.`,
    });
  }
  const description = input.description.trim();
  if (
    description.length < HOUSING_DESCRIPTION_MIN ||
    description.length > HOUSING_DESCRIPTION_MAX
  ) {
    issues.push({
      field: 'description',
      message: `La description doit faire entre ${HOUSING_DESCRIPTION_MIN} et ${HOUSING_DESCRIPTION_MAX} caractères.`,
    });
  }
  const city = input.city.trim();
  if (city.length < HOUSING_CITY_MIN || city.length > HOUSING_CITY_MAX) {
    issues.push({
      field: 'city',
      message: `La ville doit faire entre ${HOUSING_CITY_MIN} et ${HOUSING_CITY_MAX} caractères.`,
    });
  }
  if (
    !Number.isInteger(input.capacity) ||
    input.capacity < HOUSING_CAPACITY_MIN ||
    input.capacity > HOUSING_CAPACITY_MAX
  ) {
    issues.push({
      field: 'capacity',
      message: `La capacité doit être un entier entre ${HOUSING_CAPACITY_MIN} et ${HOUSING_CAPACITY_MAX}.`,
    });
  }
  const fromValue = input.availableFrom?.trim();
  const toValue = input.availableTo?.trim();
  const fromTime = fromValue ? Date.parse(fromValue) : NaN;
  const toTime = toValue ? Date.parse(toValue) : NaN;
  if (fromValue && Number.isNaN(fromTime)) {
    issues.push({ field: 'availableFrom', message: 'Date de disponibilité invalide.' });
  }
  if (toValue && Number.isNaN(toTime)) {
    issues.push({ field: 'availableTo', message: 'Date de fin invalide.' });
  }
  if (
    fromValue &&
    toValue &&
    !Number.isNaN(fromTime) &&
    !Number.isNaN(toTime) &&
    toTime < fromTime
  ) {
    issues.push({
      field: 'availableTo',
      message: 'La date de fin doit être postérieure à la date de début.',
    });
  }
  return issues;
}

/** Valide les paramètres d'une demande d'hébergement. */
export function validateRequestInput(input: RequestHousingInput): RequestValidationIssue[] {
  const issues: RequestValidationIssue[] = [];
  const message = input.message.trim();
  if (
    message.length < HOUSING_REQUEST_MESSAGE_MIN ||
    message.length > HOUSING_REQUEST_MESSAGE_MAX
  ) {
    issues.push({
      field: 'message',
      message: `Le message doit faire entre ${HOUSING_REQUEST_MESSAGE_MIN} et ${HOUSING_REQUEST_MESSAGE_MAX} caractères.`,
    });
  }
  const startsTime = Date.parse(input.startsOn);
  const endsTime = Date.parse(input.endsOn);
  if (Number.isNaN(startsTime)) {
    issues.push({ field: 'startsOn', message: 'Date d’arrivée invalide.' });
  }
  if (Number.isNaN(endsTime)) {
    issues.push({ field: 'endsOn', message: 'Date de départ invalide.' });
  }
  if (!Number.isNaN(startsTime) && !Number.isNaN(endsTime) && endsTime < startsTime) {
    issues.push({
      field: 'endsOn',
      message: 'La date de départ doit être postérieure à la date d’arrivée.',
    });
  }
  return issues;
}

/**
 * Liste les hébergements publics (`is_published=true` par défaut). Tri par
 * `created_at DESC` pour mettre les annonces récentes en haut. Le filtre `search`
 * est appliqué côté Postgres via `ilike` sur `title`, `city` et `description`
 * avec échappement des méta-caractères %, _ et ,.
 */
export async function listHousing(params: ListHousingParams = {}): Promise<ListHousingResult> {
  const limit = params.limit ?? 50;
  let query = supabase
    .from('housing')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (params.city) {
    query = query.ilike('city', params.city);
  }

  if (typeof params.capacityMin === 'number' && Number.isFinite(params.capacityMin)) {
    query = query.gte('capacity', params.capacityMin);
  }

  if (params.availableFrom) {
    query = query.lte('available_from', params.availableFrom);
  }
  if (params.availableTo) {
    query = query.gte('available_to', params.availableTo);
  }

  const search = params.search?.trim();
  if (search) {
    const escaped = search.replace(/[%_,]/g, (m) => `\\${m}`);
    query = query.or(
      `title.ilike.%${escaped}%,city.ilike.%${escaped}%,description.ilike.%${escaped}%`,
    );
  }

  const { data, error } = await query;
  return { data: data ?? [], error };
}

/**
 * Lit un hébergement par ID. Renvoie `data: null` si introuvable — la fiche
 * détail rend alors une 404 redirect côté UI. Pas de slug pour l'instant (cf.
 * HANDOFF — la table n'a pas de colonne slug).
 */
export async function getHousing(id: string): Promise<HousingResult> {
  const { data, error } = await supabase.from('housing').select('*').eq('id', id).maybeSingle();
  return { data, error };
}

/**
 * Crée une annonce d'hébergement. RLS impose `auth.uid() = host_id`. Pas de
 * slug pour l'instant — fiche accessible par ID.
 */
export async function createHousing(input: CreateHousingInput): Promise<HousingResult> {
  const issues = validateHousingInput(input);
  if (issues.length > 0) {
    return {
      data: null,
      error: new PostgrestError({
        message: issues.map((i) => i.message).join(' '),
        details: '',
        hint: issues[0]?.field ?? '',
        code: 'HOUSING_VALIDATION',
      }),
    };
  }

  const insert: HousingInsert = {
    host_id: input.hostId,
    title: input.title.trim(),
    description: input.description.trim(),
    city: input.city.trim(),
    capacity: input.capacity,
    available_from: input.availableFrom?.trim() ? input.availableFrom.trim() : null,
    available_to: input.availableTo?.trim() ? input.availableTo.trim() : null,
    is_published: input.isPublished ?? true,
  };
  const { data, error } = await supabase
    .from('housing')
    .insert(insert)
    .select('*')
    .maybeSingle();
  return { data, error };
}

/**
 * Crée une demande d'hébergement (statut `pending` par défaut). RLS empêche
 * l'hôte d'envoyer une demande sur sa propre annonce (la policy d'insert
 * vérifie `auth.uid() = requester_id`, et le check en amont vérifie qu'on ne
 * cible pas sa propre annonce).
 */
export async function requestHousing(input: RequestHousingInput): Promise<HousingRequestResult> {
  const issues = validateRequestInput(input);
  if (issues.length > 0) {
    return {
      data: null,
      error: new PostgrestError({
        message: issues.map((i) => i.message).join(' '),
        details: '',
        hint: issues[0]?.field ?? '',
        code: 'HOUSING_REQUEST_VALIDATION',
      }),
    };
  }

  const insert: HousingRequestInsert = {
    housing_id: input.housingId,
    requester_id: input.requesterId,
    message: input.message.trim(),
    starts_on: input.startsOn,
    ends_on: input.endsOn,
    status: 'pending',
  };
  const { data, error } = await supabase
    .from('housing_requests')
    .insert(insert)
    .select('*')
    .maybeSingle();
  return { data, error };
}

async function updateRequestStatus(
  id: string,
  status: HousingRequestStatus,
): Promise<HousingRequestResult> {
  const { data, error } = await supabase
    .from('housing_requests')
    .update({ status })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  return { data, error };
}

/** Le demandeur annule sa propre demande (`status='cancelled'`). */
export function cancelRequest(id: string): Promise<HousingRequestResult> {
  return updateRequestStatus(id, 'cancelled');
}

/** L'hôte accepte une demande (`status='accepted'`). */
export function acceptRequest(id: string): Promise<HousingRequestResult> {
  return updateRequestStatus(id, 'accepted');
}

/** L'hôte refuse une demande (`status='declined'`). */
export function refuseRequest(id: string): Promise<HousingRequestResult> {
  return updateRequestStatus(id, 'declined');
}
