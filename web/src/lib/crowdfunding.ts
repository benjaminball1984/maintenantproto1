import { PostgrestError } from '@supabase/supabase-js';

import { slugify } from '@/lib/slug';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type CrowdfundingCampaignRow = Database['public']['Tables']['crowdfunding_campaigns']['Row'];
export type CrowdfundingCampaignInsert =
  Database['public']['Tables']['crowdfunding_campaigns']['Insert'];
export type ContributionRow = Database['public']['Tables']['contributions']['Row'];
export type ContributionInsert = Database['public']['Tables']['contributions']['Insert'];

/** Validation des champs (cf. HANDOFF §10 Sprint 3). */
export const CROWDFUNDING_TITLE_MIN = 8;
export const CROWDFUNDING_TITLE_MAX = 80;
export const CROWDFUNDING_SUMMARY_MIN = 40;
export const CROWDFUNDING_SUMMARY_MAX = 240;
export const CROWDFUNDING_BODY_MAX = 8000;
export const CROWDFUNDING_GOAL_MIN = 1;
export const CROWDFUNDING_GOAL_MAX = 1000000;
export const CONTRIBUTION_AMOUNT_MIN = 1;
export const CONTRIBUTION_AMOUNT_MAX = 10000;

export interface ListCrowdfundingParams {
  search?: string | undefined;
  limit?: number | undefined;
}

export interface ListCrowdfundingResult {
  data: CrowdfundingCampaignRow[];
  error: PostgrestError | null;
}

export interface CrowdfundingResult {
  data: CrowdfundingCampaignRow | null;
  error: PostgrestError | null;
}

export interface ContributionResult {
  data: ContributionRow | null;
  error: PostgrestError | null;
}

export interface CreateCrowdfundingInput {
  organizerId: string;
  title: string;
  summary: string;
  body?: string | null | undefined;
  goalEur: number;
  coverUrl?: string | null | undefined;
  endsAt?: string | null | undefined;
}

export interface ContributeInput {
  campaignId: string;
  contributorId: string;
  amountEur: number;
  isAnonymous?: boolean | undefined;
}

export type CreateCrowdfundingField =
  | 'title'
  | 'summary'
  | 'body'
  | 'goalEur'
  | 'coverUrl'
  | 'endsAt';

export type ContributionField = 'amountEur';

export interface ValidationIssue {
  field: CreateCrowdfundingField;
  message: string;
}

export interface ContributionValidationIssue {
  field: ContributionField;
  message: string;
}

export function validateCrowdfundingInput(input: CreateCrowdfundingInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const title = input.title.trim();
  if (title.length < CROWDFUNDING_TITLE_MIN || title.length > CROWDFUNDING_TITLE_MAX) {
    issues.push({
      field: 'title',
      message: `Le titre doit faire entre ${CROWDFUNDING_TITLE_MIN} et ${CROWDFUNDING_TITLE_MAX} caractères.`,
    });
  }
  const summary = input.summary.trim();
  if (summary.length < CROWDFUNDING_SUMMARY_MIN || summary.length > CROWDFUNDING_SUMMARY_MAX) {
    issues.push({
      field: 'summary',
      message: `Le résumé doit faire entre ${CROWDFUNDING_SUMMARY_MIN} et ${CROWDFUNDING_SUMMARY_MAX} caractères.`,
    });
  }
  const body = input.body?.trim() ?? '';
  if (body.length > CROWDFUNDING_BODY_MAX) {
    issues.push({
      field: 'body',
      message: `Le contenu détaillé ne peut dépasser ${CROWDFUNDING_BODY_MAX} caractères.`,
    });
  }
  if (
    !Number.isFinite(input.goalEur) ||
    input.goalEur < CROWDFUNDING_GOAL_MIN ||
    input.goalEur > CROWDFUNDING_GOAL_MAX
  ) {
    issues.push({
      field: 'goalEur',
      message: `L’objectif doit être compris entre ${CROWDFUNDING_GOAL_MIN} et ${CROWDFUNDING_GOAL_MAX} €.`,
    });
  }
  if (input.endsAt) {
    const endsTime = Date.parse(input.endsAt);
    if (Number.isNaN(endsTime)) {
      issues.push({ field: 'endsAt', message: 'Date de fin invalide.' });
    } else if (endsTime <= Date.now()) {
      issues.push({
        field: 'endsAt',
        message: 'La date de fin doit être située dans le futur.',
      });
    }
  }
  return issues;
}

export function validateContribution(
  input: ContributeInput,
): ContributionValidationIssue[] {
  const issues: ContributionValidationIssue[] = [];
  if (
    !Number.isFinite(input.amountEur) ||
    input.amountEur < CONTRIBUTION_AMOUNT_MIN ||
    input.amountEur > CONTRIBUTION_AMOUNT_MAX
  ) {
    issues.push({
      field: 'amountEur',
      message: `Le montant doit être compris entre ${CONTRIBUTION_AMOUNT_MIN} et ${CONTRIBUTION_AMOUNT_MAX} €.`,
    });
  }
  return issues;
}

/**
 * Liste les cagnottes publiées. Tri par `created_at DESC`. Filtre `search`
 * cible `title` et `summary` avec échappement des méta-caractères.
 */
export async function listCrowdfunding(
  params: ListCrowdfundingParams = {},
): Promise<ListCrowdfundingResult> {
  const limit = params.limit ?? 50;
  let query = supabase
    .from('crowdfunding_campaigns')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit);

  const search = params.search?.trim();
  if (search) {
    const escaped = search.replace(/[%_,]/g, (m) => `\\${m}`);
    query = query.or(`title.ilike.%${escaped}%,summary.ilike.%${escaped}%`);
  }

  const { data, error } = await query;
  return { data: data ?? [], error };
}

/** Lit une cagnotte par ID (utilisé par /services/crowdfunding/:id). */
export async function getCrowdfunding(id: string): Promise<CrowdfundingResult> {
  const { data, error } = await supabase
    .from('crowdfunding_campaigns')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return { data, error };
}

/**
 * Crée une cagnotte. La table impose un slug unique (NOT NULL UNIQUE) : on
 * réutilise le même pattern de retry sur 23505 que pour `campaigns`.
 */
export async function createCrowdfunding(
  input: CreateCrowdfundingInput,
): Promise<CrowdfundingResult> {
  const issues = validateCrowdfundingInput(input);
  if (issues.length > 0) {
    return {
      data: null,
      error: new PostgrestError({
        message: issues.map((i) => i.message).join(' '),
        details: '',
        hint: issues[0]?.field ?? '',
        code: 'CROWDFUNDING_VALIDATION',
      }),
    };
  }
  const body = input.body?.trim();
  const coverUrl = input.coverUrl?.trim();
  const endsAt = input.endsAt?.trim();
  const baseSlug = slugify(input.title) || 'cagnotte';
  let attempt = 0;
  while (attempt < 5) {
    const suffix = attempt === 0 ? '' : `-${attempt + 1}`;
    const slug = `${baseSlug}${suffix}`.slice(0, 80);
    const insert: CrowdfundingCampaignInsert = {
      organizer_id: input.organizerId,
      title: input.title.trim(),
      slug,
      summary: input.summary.trim(),
      body: body ? body : null,
      goal_eur: input.goalEur,
      cover_url: coverUrl ? coverUrl : null,
      ends_at: endsAt ? endsAt : null,
      status: 'published',
    };
    const { data, error } = await supabase
      .from('crowdfunding_campaigns')
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
      message: 'Impossible de générer un slug unique. Modifiez le titre.',
      details: '',
      hint: '',
      code: 'CROWDFUNDING_SLUG_COLLISION',
    }),
  };
}

/**
 * Enregistre une contribution. Les contributions ne sont pas modifiables
 * (intégrité comptable) — RLS impose `auth.uid() = contributor_id` à
 * l'insertion. `stripe_payment_intent` est laissé `null` côté front : la
 * mise à jour `raised_eur` côté table cagnotte sera faite plus tard via le
 * webhook Stripe (sprint paiement).
 */
export async function contribute(input: ContributeInput): Promise<ContributionResult> {
  const issues = validateContribution(input);
  if (issues.length > 0) {
    return {
      data: null,
      error: new PostgrestError({
        message: issues.map((i) => i.message).join(' '),
        details: '',
        hint: issues[0]?.field ?? '',
        code: 'CONTRIBUTION_VALIDATION',
      }),
    };
  }
  const insert: ContributionInsert = {
    campaign_id: input.campaignId,
    contributor_id: input.contributorId,
    amount_eur: input.amountEur,
    is_anonymous: input.isAnonymous ?? false,
  };
  const { data, error } = await supabase
    .from('contributions')
    .insert(insert)
    .select('*')
    .maybeSingle();
  return { data, error };
}
