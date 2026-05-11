import { PostgrestError } from '@supabase/supabase-js';

import { slugify } from '@/lib/slug';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type PollRow = Database['public']['Tables']['polls']['Row'];
export type PollInsert = Database['public']['Tables']['polls']['Insert'];
export type PollStatus = Database['public']['Enums']['content_status'];
export type PollOptionRow = Database['public']['Tables']['poll_options']['Row'];
export type PollOptionInsert = Database['public']['Tables']['poll_options']['Insert'];
export type VoteRow = Database['public']['Tables']['votes']['Row'];

/** Sondage + options déjà jointes — utilisé par la fiche détail. */
export interface PollWithOptions {
  poll: PollRow;
  options: PollOptionRow[];
}

/** Validation des champs du formulaire de création (cf. HANDOFF §10 Sprint 2). */
export const POLL_QUESTION_MIN = 8;
export const POLL_QUESTION_MAX = 200;
export const POLL_DESCRIPTION_MIN = 40;
export const POLL_DESCRIPTION_MAX = 400;
export const POLL_OPTION_MIN = 2;
export const POLL_OPTION_MAX = 80;
export const POLL_OPTIONS_MIN_COUNT = 2;
export const POLL_OPTIONS_MAX_COUNT = 8;

export interface ListPollsParams {
  status?: PollStatus | undefined;
  search?: string | undefined;
  limit?: number | undefined;
}

export interface ListPollsResult {
  data: PollRow[];
  error: PostgrestError | null;
}

export interface PollResult {
  data: PollWithOptions | null;
  error: PostgrestError | null;
}

export interface PollCreateResult {
  data: PollWithOptions | null;
  error: PostgrestError | null;
}

export interface VoteResult {
  data: VoteRow | null;
  error: PostgrestError | null;
}

export interface VoidResult {
  error: PostgrestError | null;
}

export interface HasVotedResult {
  voted: boolean;
  error: PostgrestError | null;
}

export interface UserVoteResult {
  optionId: string | null;
  error: PostgrestError | null;
}

export interface CreatePollInput {
  authorId: string;
  question: string;
  description: string;
  options: string[];
  membersOnly?: boolean | undefined;
  closesAt?: string | null | undefined;
}

export type CreatePollField = 'question' | 'description' | 'options' | 'membersOnly' | 'closesAt';

export interface ValidationIssue {
  field: CreatePollField;
  message: string;
}

/** Valide l'input avant insertion. Retourne `[]` si tout est OK. */
export function validatePollInput(input: CreatePollInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const question = input.question.trim();
  if (question.length < POLL_QUESTION_MIN || question.length > POLL_QUESTION_MAX) {
    issues.push({
      field: 'question',
      message: `La question doit faire entre ${POLL_QUESTION_MIN} et ${POLL_QUESTION_MAX} caractères.`,
    });
  }
  const description = input.description.trim();
  if (description.length < POLL_DESCRIPTION_MIN || description.length > POLL_DESCRIPTION_MAX) {
    issues.push({
      field: 'description',
      message: `La description doit faire entre ${POLL_DESCRIPTION_MIN} et ${POLL_DESCRIPTION_MAX} caractères.`,
    });
  }
  const trimmedOptions = input.options.map((opt) => opt.trim()).filter((opt) => opt.length > 0);
  if (
    trimmedOptions.length < POLL_OPTIONS_MIN_COUNT ||
    trimmedOptions.length > POLL_OPTIONS_MAX_COUNT
  ) {
    issues.push({
      field: 'options',
      message: `Le sondage doit comporter entre ${POLL_OPTIONS_MIN_COUNT} et ${POLL_OPTIONS_MAX_COUNT} options.`,
    });
  } else {
    for (const opt of trimmedOptions) {
      if (opt.length < POLL_OPTION_MIN || opt.length > POLL_OPTION_MAX) {
        issues.push({
          field: 'options',
          message: `Chaque option doit faire entre ${POLL_OPTION_MIN} et ${POLL_OPTION_MAX} caractères.`,
        });
        break;
      }
    }
    const seen = new Set<string>();
    for (const opt of trimmedOptions) {
      const lower = opt.toLowerCase();
      if (seen.has(lower)) {
        issues.push({ field: 'options', message: 'Les options doivent être distinctes.' });
        break;
      }
      seen.add(lower);
    }
  }
  if (input.closesAt) {
    const closesAtTime = Date.parse(input.closesAt);
    if (Number.isNaN(closesAtTime)) {
      issues.push({ field: 'closesAt', message: 'Date de clôture invalide.' });
    } else if (closesAtTime <= Date.now()) {
      issues.push({
        field: 'closesAt',
        message: 'La date de clôture doit être dans le futur.',
      });
    }
  }
  return issues;
}

/**
 * Liste les sondages publics (status='published' par défaut). Tri par
 * created_at DESC pour mettre les plus récents en haut. La fiche est lazy
 * (options chargées dans getPoll(slug)).
 */
export async function listPolls(params: ListPollsParams = {}): Promise<ListPollsResult> {
  const status: PollStatus = params.status ?? 'published';
  const limit = params.limit ?? 50;

  let query = supabase
    .from('polls')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(limit);

  const search = params.search?.trim();
  if (search) {
    const escaped = search.replace(/[%_,]/g, (m) => `\\${m}`);
    query = query.or(`question.ilike.%${escaped}%,description.ilike.%${escaped}%`);
  }

  const { data, error } = await query;
  return { data: data ?? [], error };
}

/**
 * Lit un sondage par slug et ses options associées (route `/polls/:slug`).
 * Renvoie `data: null` si le sondage n'existe pas. Les options sont triées
 * par `position ASC` pour rester stables entre rendus.
 */
export async function getPoll(slug: string): Promise<PollResult> {
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (pollError) return { data: null, error: pollError };
  if (!poll) return { data: null, error: null };

  const { data: options, error: optError } = await supabase
    .from('poll_options')
    .select('*')
    .eq('poll_id', poll.id)
    .order('position', { ascending: true });
  if (optError) return { data: null, error: optError };
  return { data: { poll, options: options ?? [] }, error: null };
}

/**
 * Crée un sondage et insère toutes ses options. Pas de transaction native côté
 * PostgREST : on insère le poll, puis les options ; en cas d'erreur sur le
 * second insert on rollback manuellement (DELETE du poll). RLS empêche tout
 * autre user de voir le poll orphelin avant rollback (le poll est publié, mais
 * sans options la fiche ne s'affichera pas correctement de toute façon).
 *
 * Slug auto via slugify(question) ; retry incrémental sur collision (23505).
 */
export async function createPoll(input: CreatePollInput): Promise<PollCreateResult> {
  const issues = validatePollInput(input);
  if (issues.length > 0) {
    return {
      data: null,
      error: new PostgrestError({
        message: issues.map((i) => i.message).join(' '),
        details: '',
        hint: issues[0]?.field ?? '',
        code: 'POLL_VALIDATION',
      }),
    };
  }

  const trimmedOptions = input.options.map((opt) => opt.trim()).filter((opt) => opt.length > 0);
  const baseSlug = slugify(input.question) || 'sondage';
  let attempt = 0;
  let poll: PollRow | null = null;
  while (attempt < 5 && !poll) {
    const suffix = attempt === 0 ? '' : `-${attempt + 1}`;
    const slug = `${baseSlug}${suffix}`.slice(0, 80);
    const insert: PollInsert = {
      author_id: input.authorId,
      slug,
      question: input.question.trim(),
      description: input.description.trim(),
      members_only: input.membersOnly ?? true,
      closes_at: input.closesAt ?? null,
      status: 'published',
    };
    const { data, error } = await supabase.from('polls').insert(insert).select('*').maybeSingle();
    if (!error && data) {
      poll = data;
      break;
    }
    if (error?.code === '23505') {
      attempt += 1;
      continue;
    }
    return { data: null, error: error ?? null };
  }
  if (!poll) {
    return {
      data: null,
      error: new PostgrestError({
        message: 'Impossible de générer un slug unique. Modifiez la question.',
        details: '',
        hint: '',
        code: 'POLL_SLUG_COLLISION',
      }),
    };
  }

  const optionsInsert: PollOptionInsert[] = trimmedOptions.map((label, index) => ({
    poll_id: poll.id,
    label,
    position: index,
  }));
  const { data: insertedOptions, error: optError } = await supabase
    .from('poll_options')
    .insert(optionsInsert)
    .select('*');
  if (optError || !insertedOptions) {
    // Rollback manuel : si l'insertion des options échoue, on supprime le poll
    // pour ne pas laisser un sondage sans choix de vote.
    await supabase.from('polls').delete().eq('id', poll.id);
    return { data: null, error: optError };
  }

  const sorted = [...insertedOptions].sort((a, b) => a.position - b.position);
  return { data: { poll, options: sorted }, error: null };
}

/**
 * Insère un vote pour l'utilisateur courant. La policy RLS
 * `votes_insert_member` vérifie `auth.uid() = user_id` et que l'utilisateur
 * est adhérent si `members_only`. La contrainte UNIQUE `(poll_id, user_id)`
 * empêche le double-vote ; le trigger `votes_count_inc` met à jour
 * `poll_options.vote_count`.
 */
export async function votePoll(
  pollId: string,
  optionId: string,
  userId: string,
): Promise<VoteResult> {
  const { data, error } = await supabase
    .from('votes')
    .insert({ poll_id: pollId, option_id: optionId, user_id: userId })
    .select('*')
    .maybeSingle();
  return { data, error };
}

/** Retire le vote de l'utilisateur courant (RGPD : retrait de consentement). */
export async function unvotePoll(pollId: string, userId: string): Promise<VoidResult> {
  const { error } = await supabase
    .from('votes')
    .delete()
    .eq('poll_id', pollId)
    .eq('user_id', userId);
  return { error };
}

/** Vrai si l'utilisateur a déjà voté à ce sondage. */
export async function hasUserVoted(pollId: string, userId: string): Promise<HasVotedResult> {
  const { data, error } = await supabase
    .from('votes')
    .select('id')
    .eq('poll_id', pollId)
    .eq('user_id', userId)
    .maybeSingle();
  return { voted: Boolean(data), error };
}

/**
 * Renvoie l'option votée par l'utilisateur (pour pré-cocher l'option dans la
 * fiche). `optionId === null` si l'utilisateur n'a pas voté.
 */
export async function getUserVote(pollId: string, userId: string): Promise<UserVoteResult> {
  const { data, error } = await supabase
    .from('votes')
    .select('option_id')
    .eq('poll_id', pollId)
    .eq('user_id', userId)
    .maybeSingle();
  return { optionId: data?.option_id ?? null, error };
}
