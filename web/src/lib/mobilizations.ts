import { PostgrestError } from '@supabase/supabase-js';

import { slugify } from '@/lib/slug';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type MobilizationRow = Database['public']['Tables']['mobilizations']['Row'];
export type MobilizationInsert = Database['public']['Tables']['mobilizations']['Insert'];
export type MobilizationStatus = Database['public']['Enums']['content_status'];
export type ParticipationRow = Database['public']['Tables']['participations']['Row'];

/** Validation des champs du formulaire de création (cf. HANDOFF §10 Sprint 2). */
export const MOBILIZATION_TITLE_MIN = 8;
export const MOBILIZATION_TITLE_MAX = 80;
export const MOBILIZATION_SUMMARY_MIN = 40;
export const MOBILIZATION_SUMMARY_MAX = 240;
export const MOBILIZATION_BODY_MIN = 100;
export const MOBILIZATION_CITY_MIN = 2;
export const MOBILIZATION_CITY_MAX = 80;

export interface ListMobilizationsParams {
  status?: MobilizationStatus | undefined;
  search?: string | undefined;
  city?: string | undefined;
  startsAfter?: string | undefined;
  startsBefore?: string | undefined;
  limit?: number | undefined;
}

export interface ListMobilizationsResult {
  data: MobilizationRow[];
  error: PostgrestError | null;
}

export interface MobilizationResult {
  data: MobilizationRow | null;
  error: PostgrestError | null;
}

export interface ParticipationResult {
  data: ParticipationRow | null;
  error: PostgrestError | null;
}

export interface VoidResult {
  error: PostgrestError | null;
}

export interface HasRsvpResult {
  rsvp: boolean;
  error: PostgrestError | null;
}

export interface CreateMobilizationInput {
  organizerId: string;
  title: string;
  summary: string;
  body?: string | null | undefined;
  city: string;
  address?: string | null | undefined;
  startsAt: string;
  endsAt?: string | null | undefined;
  coverUrl?: string | null | undefined;
}

export interface ValidationIssue {
  field: keyof CreateMobilizationInput;
  message: string;
}

/** Valide l'input avant insertion. Retourne `[]` si tout est OK. */
export function validateMobilizationInput(input: CreateMobilizationInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const title = input.title.trim();
  if (title.length < MOBILIZATION_TITLE_MIN || title.length > MOBILIZATION_TITLE_MAX) {
    issues.push({
      field: 'title',
      message: `Le titre doit faire entre ${MOBILIZATION_TITLE_MIN} et ${MOBILIZATION_TITLE_MAX} caractères.`,
    });
  }
  const summary = input.summary.trim();
  if (summary.length < MOBILIZATION_SUMMARY_MIN || summary.length > MOBILIZATION_SUMMARY_MAX) {
    issues.push({
      field: 'summary',
      message: `Le résumé doit faire entre ${MOBILIZATION_SUMMARY_MIN} et ${MOBILIZATION_SUMMARY_MAX} caractères.`,
    });
  }
  const body = input.body?.trim() ?? '';
  if (body.length > 0 && body.length < MOBILIZATION_BODY_MIN) {
    issues.push({
      field: 'body',
      message: `La présentation détaillée doit faire au moins ${MOBILIZATION_BODY_MIN} caractères (ou être laissée vide).`,
    });
  }
  const city = input.city.trim();
  if (city.length < MOBILIZATION_CITY_MIN || city.length > MOBILIZATION_CITY_MAX) {
    issues.push({
      field: 'city',
      message: `La ville doit faire entre ${MOBILIZATION_CITY_MIN} et ${MOBILIZATION_CITY_MAX} caractères.`,
    });
  }
  const startsAtTime = Date.parse(input.startsAt);
  if (Number.isNaN(startsAtTime)) {
    issues.push({
      field: 'startsAt',
      message: 'Date de début invalide.',
    });
  }
  if (input.endsAt) {
    const endsAtTime = Date.parse(input.endsAt);
    if (Number.isNaN(endsAtTime)) {
      issues.push({
        field: 'endsAt',
        message: 'Date de fin invalide.',
      });
    } else if (!Number.isNaN(startsAtTime) && endsAtTime < startsAtTime) {
      issues.push({
        field: 'endsAt',
        message: 'La date de fin doit être postérieure à la date de début.',
      });
    }
  }
  return issues;
}

/**
 * Liste les mobilisations publiques (status='published' par défaut). Toutes les
 * colonnes sont remontées (compteur dénormalisé inclus). Tri par défaut sur
 * `starts_at` ASC pour afficher les événements à venir en premier.
 *
 * `search` est appliqué côté Postgres via `ilike` sur le titre puis sur le
 * résumé — pour gros volume on basculera sur Postgres full-text plus tard.
 */
export async function listMobilizations(
  params: ListMobilizationsParams = {},
): Promise<ListMobilizationsResult> {
  const status: MobilizationStatus = params.status ?? 'published';
  const limit = params.limit ?? 50;

  let query = supabase
    .from('mobilizations')
    .select('*')
    .eq('status', status)
    .order('starts_at', { ascending: true })
    .limit(limit);

  if (params.city) {
    query = query.ilike('city', params.city);
  }

  if (params.startsAfter) {
    query = query.gte('starts_at', params.startsAfter);
  }
  if (params.startsBefore) {
    query = query.lte('starts_at', params.startsBefore);
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
 * Lit une mobilisation par slug (route `/mobilizations/:slug`). Renvoie
 * `data: null` si absente — l'appelant rend alors une 404 redirect.
 */
export async function getMobilization(slug: string): Promise<MobilizationResult> {
  const { data, error } = await supabase
    .from('mobilizations')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  return { data, error };
}

/**
 * Tente de créer une mobilisation avec un slug unique. En cas de collision
 * (code 23505 sur la contrainte `mobilizations_slug_key`), retente avec un
 * suffixe incrémental, jusqu'à 5 fois.
 */
export async function createMobilization(
  input: CreateMobilizationInput,
): Promise<MobilizationResult> {
  const issues = validateMobilizationInput(input);
  if (issues.length > 0) {
    return {
      data: null,
      error: new PostgrestError({
        message: issues.map((i) => i.message).join(' '),
        details: '',
        hint: issues[0]?.field ?? '',
        code: 'MOBILIZATION_VALIDATION',
      }),
    };
  }

  const baseSlug = slugify(input.title) || 'mobilisation';
  let attempt = 0;
  while (attempt < 5) {
    const suffix = attempt === 0 ? '' : `-${attempt + 1}`;
    const slug = `${baseSlug}${suffix}`.slice(0, 80);
    const body = input.body?.trim();
    const address = input.address?.trim();
    const coverUrl = input.coverUrl?.trim();
    const insert: MobilizationInsert = {
      organizer_id: input.organizerId,
      title: input.title.trim(),
      slug,
      summary: input.summary.trim(),
      body: body ? body : null,
      city: input.city.trim(),
      address: address ? address : null,
      starts_at: input.startsAt,
      ends_at: input.endsAt ?? null,
      cover_url: coverUrl ? coverUrl : null,
      status: 'published',
    };
    const { data, error } = await supabase
      .from('mobilizations')
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
      code: 'MOBILIZATION_SLUG_COLLISION',
    }),
  };
}

/**
 * Insère une participation pour l'utilisateur courant. La policy RLS
 * `participations_insert_self` vérifie `auth.uid() = user_id`, et la contrainte
 * UNIQUE `(mobilization_id, user_id)` empêche les doublons. Le trigger
 * `participations_count_inc` met automatiquement à jour
 * `mobilizations.participation_count`.
 */
export async function rsvpMobilization(
  mobilizationId: string,
  userId: string,
): Promise<ParticipationResult> {
  const { data, error } = await supabase
    .from('participations')
    .insert({ mobilization_id: mobilizationId, user_id: userId })
    .select('*')
    .maybeSingle();
  return { data, error };
}

/** Retire la participation de l'utilisateur courant (RGPD : retrait). */
export async function cancelRsvp(mobilizationId: string, userId: string): Promise<VoidResult> {
  const { error } = await supabase
    .from('participations')
    .delete()
    .eq('mobilization_id', mobilizationId)
    .eq('user_id', userId);
  return { error };
}

/** Vrai si l'utilisateur s'est déjà inscrit à la mobilisation. */
export async function hasUserRsvp(mobilizationId: string, userId: string): Promise<HasRsvpResult> {
  const { data, error } = await supabase
    .from('participations')
    .select('id')
    .eq('mobilization_id', mobilizationId)
    .eq('user_id', userId)
    .maybeSingle();
  return { rsvp: Boolean(data), error };
}
