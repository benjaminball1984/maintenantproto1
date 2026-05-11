import { PostgrestError } from '@supabase/supabase-js';

import { slugify } from '@/lib/slug';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type CampaignRow = Database['public']['Tables']['campaigns']['Row'];
export type CampaignInsert = Database['public']['Tables']['campaigns']['Insert'];
export type CampaignStatus = Database['public']['Enums']['content_status'];
export type CampaignActionRow = Database['public']['Tables']['campaign_actions']['Row'];
export type CampaignActionInsert = Database['public']['Tables']['campaign_actions']['Insert'];

/** Campagne + actions jointes — utilisé par la fiche détail. */
export interface CampaignWithActions {
  campaign: CampaignRow;
  actions: CampaignActionRow[];
}

/** Validation des champs du formulaire de création (cf. HANDOFF §10 Sprint 2). */
export const CAMPAIGN_TITLE_MIN = 8;
export const CAMPAIGN_TITLE_MAX = 80;
export const CAMPAIGN_SUMMARY_MIN = 40;
export const CAMPAIGN_SUMMARY_MAX = 240;
export const CAMPAIGN_BODY_MIN = 100;
export const CAMPAIGN_ACTIONS_MIN_COUNT = 1;
export const CAMPAIGN_ACTIONS_MAX_COUNT = 12;
export const CAMPAIGN_ACTION_LABEL_MAX = 120;

export interface ListCampaignsParams {
  status?: CampaignStatus | undefined;
  search?: string | undefined;
  limit?: number | undefined;
}

export interface ListCampaignsResult {
  data: CampaignRow[];
  error: PostgrestError | null;
}

export interface CampaignResult {
  data: CampaignWithActions | null;
  error: PostgrestError | null;
}

export interface CampaignCreateResult {
  data: CampaignWithActions | null;
  error: PostgrestError | null;
}

export interface CampaignActionResult {
  data: CampaignActionRow | null;
  error: PostgrestError | null;
}

export interface VoidResult {
  error: PostgrestError | null;
}

/** Référence à une ressource liée à une action de campagne (au moins une FK doit être fournie). */
export interface CampaignActionRef {
  petitionId?: string | null | undefined;
  mobilizationId?: string | null | undefined;
  pollId?: string | null | undefined;
  crowdfundingId?: string | null | undefined;
  label?: string | null | undefined;
}

export interface CreateCampaignInput {
  authorId: string;
  title: string;
  summary: string;
  body?: string | null | undefined;
  coverUrl?: string | null | undefined;
  actions: CampaignActionRef[];
}

export type CreateCampaignField = 'title' | 'summary' | 'body' | 'coverUrl' | 'actions';

export interface ValidationIssue {
  field: CreateCampaignField;
  message: string;
}

function hasAtLeastOneRef(ref: CampaignActionRef): boolean {
  return Boolean(ref.petitionId || ref.mobilizationId || ref.pollId || ref.crowdfundingId);
}

/** Valide l'input avant insertion. Retourne `[]` si tout est OK. */
export function validateCampaignInput(input: CreateCampaignInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const title = input.title.trim();
  if (title.length < CAMPAIGN_TITLE_MIN || title.length > CAMPAIGN_TITLE_MAX) {
    issues.push({
      field: 'title',
      message: `Le titre doit faire entre ${CAMPAIGN_TITLE_MIN} et ${CAMPAIGN_TITLE_MAX} caractères.`,
    });
  }
  const summary = input.summary.trim();
  if (summary.length < CAMPAIGN_SUMMARY_MIN || summary.length > CAMPAIGN_SUMMARY_MAX) {
    issues.push({
      field: 'summary',
      message: `Le résumé doit faire entre ${CAMPAIGN_SUMMARY_MIN} et ${CAMPAIGN_SUMMARY_MAX} caractères.`,
    });
  }
  const body = input.body?.trim() ?? '';
  if (body.length > 0 && body.length < CAMPAIGN_BODY_MIN) {
    issues.push({
      field: 'body',
      message: `Le manifeste détaillé doit faire au moins ${CAMPAIGN_BODY_MIN} caractères (ou être laissé vide).`,
    });
  }
  if (
    input.actions.length < CAMPAIGN_ACTIONS_MIN_COUNT ||
    input.actions.length > CAMPAIGN_ACTIONS_MAX_COUNT
  ) {
    issues.push({
      field: 'actions',
      message: `Une campagne doit comporter entre ${CAMPAIGN_ACTIONS_MIN_COUNT} et ${CAMPAIGN_ACTIONS_MAX_COUNT} actions.`,
    });
  } else {
    for (const action of input.actions) {
      if (!hasAtLeastOneRef(action)) {
        issues.push({
          field: 'actions',
          message:
            'Chaque action doit référencer une pétition, une mobilisation, un sondage ou une cagnotte.',
        });
        break;
      }
    }
  }
  return issues;
}

/**
 * Liste les campagnes publiques (status='published' par défaut). Tri par
 * `created_at DESC` pour mettre les plus récentes en haut. La fiche est lazy
 * (actions chargées dans `getCampaign(slug)`).
 *
 * `search` est appliqué côté Postgres via `ilike` sur le titre et le résumé.
 */
export async function listCampaigns(
  params: ListCampaignsParams = {},
): Promise<ListCampaignsResult> {
  const status: CampaignStatus = params.status ?? 'published';
  const limit = params.limit ?? 50;

  let query = supabase
    .from('campaigns')
    .select('*')
    .eq('status', status)
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

/**
 * Lit une campagne par slug et ses actions associées (route `/campaigns/:slug`).
 * Renvoie `data: null` si la campagne n'existe pas. Les actions sont triées
 * par `position ASC` pour rester stables entre rendus. Les jointures vers les
 * ressources cibles (pétitions / mobilisations / etc.) sont volontairement
 * laissées au consommateur — la fiche fait un fetch séparé sur le slug si
 * nécessaire, ce qui évite un select imbriqué lourd et bénéficie au cache HTTP.
 */
export async function getCampaign(slug: string): Promise<CampaignResult> {
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (campaignError) return { data: null, error: campaignError };
  if (!campaign) return { data: null, error: null };

  const { data: actions, error: actionsError } = await supabase
    .from('campaign_actions')
    .select('*')
    .eq('campaign_id', campaign.id)
    .order('position', { ascending: true });
  if (actionsError) return { data: null, error: actionsError };
  return { data: { campaign, actions: actions ?? [] }, error: null };
}

/**
 * Crée une campagne et insère toutes ses actions. Pas de transaction native
 * côté PostgREST : on insère la campagne, puis les actions ; en cas d'erreur
 * sur le second insert on rollback manuellement (DELETE de la campagne).
 *
 * Slug auto via `slugify(title)` ; retry incrémental sur collision (23505),
 * jusqu'à 5 tentatives.
 */
export async function createCampaign(input: CreateCampaignInput): Promise<CampaignCreateResult> {
  const issues = validateCampaignInput(input);
  if (issues.length > 0) {
    return {
      data: null,
      error: new PostgrestError({
        message: issues.map((i) => i.message).join(' '),
        details: '',
        hint: issues[0]?.field ?? '',
        code: 'CAMPAIGN_VALIDATION',
      }),
    };
  }

  const body = input.body?.trim();
  const coverUrl = input.coverUrl?.trim();
  const baseSlug = slugify(input.title) || 'campagne';
  let attempt = 0;
  let campaign: CampaignRow | null = null;
  while (attempt < 5 && !campaign) {
    const suffix = attempt === 0 ? '' : `-${attempt + 1}`;
    const slug = `${baseSlug}${suffix}`.slice(0, 80);
    const insert: CampaignInsert = {
      author_id: input.authorId,
      title: input.title.trim(),
      slug,
      summary: input.summary.trim(),
      body: body ? body : null,
      cover_url: coverUrl ? coverUrl : null,
      status: 'published',
    };
    const { data, error } = await supabase
      .from('campaigns')
      .insert(insert)
      .select('*')
      .maybeSingle();
    if (!error && data) {
      campaign = data;
      break;
    }
    if (error?.code === '23505') {
      attempt += 1;
      continue;
    }
    return { data: null, error: error ?? null };
  }
  if (!campaign) {
    return {
      data: null,
      error: new PostgrestError({
        message: 'Impossible de générer un slug unique. Modifiez le titre.',
        details: '',
        hint: '',
        code: 'CAMPAIGN_SLUG_COLLISION',
      }),
    };
  }

  const actionsInsert: CampaignActionInsert[] = input.actions.map((ref, index) => ({
    campaign_id: campaign.id,
    petition_id: ref.petitionId ?? null,
    mobilization_id: ref.mobilizationId ?? null,
    poll_id: ref.pollId ?? null,
    crowdfunding_id: ref.crowdfundingId ?? null,
    label: ref.label?.trim() ? ref.label.trim() : null,
    position: index,
  }));
  const { data: insertedActions, error: actionsError } = await supabase
    .from('campaign_actions')
    .insert(actionsInsert)
    .select('*');
  if (actionsError || !insertedActions) {
    // Rollback manuel : si l'insertion des actions échoue, on supprime la
    // campagne pour ne pas la laisser orpheline sans aucune action.
    await supabase.from('campaigns').delete().eq('id', campaign.id);
    return { data: null, error: actionsError };
  }

  const sorted = [...insertedActions].sort((a, b) => a.position - b.position);
  return { data: { campaign, actions: sorted }, error: null };
}

/**
 * Ajoute une action à une campagne existante. RLS impose que l'utilisateur
 * courant soit l'auteur de la campagne (policy `campaign_actions_write_author`).
 * La position est calculée par l'appelant (ex. count actuel des actions) — si
 * non fournie, on insère à 0 et l'ordre dépendra de l'ordre d'insertion.
 */
export async function addCampaignAction(
  campaignId: string,
  ref: CampaignActionRef,
  position = 0,
): Promise<CampaignActionResult> {
  if (!hasAtLeastOneRef(ref)) {
    return {
      data: null,
      error: new PostgrestError({
        message:
          'Chaque action doit référencer une pétition, une mobilisation, un sondage ou une cagnotte.',
        details: '',
        hint: 'actions',
        code: 'CAMPAIGN_VALIDATION',
      }),
    };
  }
  const insert: CampaignActionInsert = {
    campaign_id: campaignId,
    petition_id: ref.petitionId ?? null,
    mobilization_id: ref.mobilizationId ?? null,
    poll_id: ref.pollId ?? null,
    crowdfunding_id: ref.crowdfundingId ?? null,
    label: ref.label?.trim() ? ref.label.trim() : null,
    position,
  };
  const { data, error } = await supabase
    .from('campaign_actions')
    .insert(insert)
    .select('*')
    .maybeSingle();
  return { data, error };
}

/** Retire une action de campagne (RLS : author seulement). */
export async function removeCampaignAction(id: string): Promise<VoidResult> {
  const { error } = await supabase.from('campaign_actions').delete().eq('id', id);
  return { error };
}
