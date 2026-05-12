import { PostgrestError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Database, Json } from '@/types/database';

export type AdminLogRow = Database['public']['Tables']['admin_logs']['Row'];
export type AdminLogInsert = Database['public']['Tables']['admin_logs']['Insert'];
export type EmailCampaignRow = Database['public']['Tables']['email_campaigns']['Row'];
export type EmailCampaignInsert = Database['public']['Tables']['email_campaigns']['Insert'];
export type EmailCampaignUpdate = Database['public']['Tables']['email_campaigns']['Update'];

export type FlaggedKind = 'article' | 'post' | 'post_comment' | 'comment';

export type EmailCampaignStatus = 'draft' | 'queued' | 'sent' | 'failed';

const EMAIL_CAMPAIGN_STATUSES: readonly EmailCampaignStatus[] = [
  'draft',
  'queued',
  'sent',
  'failed',
];

/** Validation des campagnes email (cf. HANDOFF §10 Sprint 5). */
export const EMAIL_SUBJECT_MIN = 4;
export const EMAIL_SUBJECT_MAX = 200;
export const EMAIL_BODY_MIN = 20;
export const EMAIL_BODY_MAX = 100000;
export const EMAIL_AUDIENCE_MIN = 1;
export const EMAIL_AUDIENCE_MAX = 100;

export interface FlaggedItem {
  kind: FlaggedKind;
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  /** Pour les articles, le slug pour générer une URL `/media/:slug`. */
  slug?: string | null;
  /** Pour les articles, le titre. */
  title?: string | null;
  /** Pour les commentaires d'article, l'ID de l'article parent. */
  articleId?: string | null;
  /** Pour les commentaires de post, l'ID du post parent. */
  postId?: string | null;
}

export interface FlaggedListResult {
  data: FlaggedItem[];
  error: PostgrestError | null;
}

export interface AdminLogResult {
  data: AdminLogRow | null;
  error: PostgrestError | null;
}

export interface AdminLogListResult {
  data: AdminLogRow[];
  error: PostgrestError | null;
}

export interface EmailCampaignResult {
  data: EmailCampaignRow | null;
  error: PostgrestError | null;
}

export interface EmailCampaignListResult {
  data: EmailCampaignRow[];
  error: PostgrestError | null;
}

export interface CreateEmailCampaignInput {
  authorId: string;
  subject: string;
  bodyHtml: string;
  audience: string;
  status?: EmailCampaignStatus | undefined;
  scheduledFor?: string | null | undefined;
}

export type CreateEmailCampaignField = 'subject' | 'bodyHtml' | 'audience' | 'status';

export interface EmailCampaignValidationIssue {
  field: CreateEmailCampaignField;
  message: string;
}

export function validateEmailCampaignInput(
  input: CreateEmailCampaignInput,
): EmailCampaignValidationIssue[] {
  const issues: EmailCampaignValidationIssue[] = [];
  const subject = input.subject.trim();
  if (subject.length < EMAIL_SUBJECT_MIN || subject.length > EMAIL_SUBJECT_MAX) {
    issues.push({
      field: 'subject',
      message: `Le sujet doit faire entre ${EMAIL_SUBJECT_MIN} et ${EMAIL_SUBJECT_MAX} caractères.`,
    });
  }
  const body = input.bodyHtml.trim();
  if (body.length < EMAIL_BODY_MIN || body.length > EMAIL_BODY_MAX) {
    issues.push({
      field: 'bodyHtml',
      message: `Le corps doit faire entre ${EMAIL_BODY_MIN} et ${EMAIL_BODY_MAX} caractères.`,
    });
  }
  const audience = input.audience.trim();
  if (audience.length < EMAIL_AUDIENCE_MIN || audience.length > EMAIL_AUDIENCE_MAX) {
    issues.push({
      field: 'audience',
      message: `L’audience doit faire entre ${EMAIL_AUDIENCE_MIN} et ${EMAIL_AUDIENCE_MAX} caractères.`,
    });
  }
  if (input.status && !EMAIL_CAMPAIGN_STATUSES.includes(input.status)) {
    issues.push({ field: 'status', message: 'Statut de campagne invalide.' });
  }
  return issues;
}

/**
 * Vérifie si l'utilisateur courant est admin via la RPC SQL `public.is_admin`.
 * Cette fonction est `security definer` côté DB (cf. db/schema.sql §1) — elle
 * peut être appelée sans privilège particulier. Renvoie `false` par défaut si
 * la requête échoue (mode strict : on n'expose jamais les actions admin).
 */
export async function checkIsAdmin(uid: string | undefined): Promise<boolean> {
  if (!uid) return false;
  const { data, error } = await supabase.rpc('is_admin', { uid });
  if (error || data === null || data === undefined) return false;
  return Boolean(data);
}

/**
 * Liste les articles modérés (`status = 'flagged'`). RLS : le filter passe
 * pour l'auteur et pour `public.is_admin(auth.uid())` ; côté front on n'expose
 * cet appel qu'à l'intérieur d'un panel admin (RequireAdmin).
 */
export async function listFlaggedArticles(limit = 50): Promise<FlaggedListResult> {
  const { data, error } = await supabase
    .from('articles')
    .select('id, author_id, title, slug, body, created_at')
    .eq('status', 'flagged')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    return { data: [], error };
  }
  const rows = data ?? [];
  return {
    data: rows.map((row) => ({
      kind: 'article' as const,
      id: row.id,
      authorId: row.author_id,
      body: row.body,
      createdAt: row.created_at,
      slug: row.slug,
      title: row.title,
    })),
    error: null,
  };
}

/** Liste les posts du réseau social modérés (`is_flagged = true`). */
export async function listFlaggedPosts(limit = 50): Promise<FlaggedListResult> {
  const { data, error } = await supabase
    .from('posts')
    .select('id, author_id, body, created_at')
    .eq('is_flagged', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    return { data: [], error };
  }
  const rows = data ?? [];
  return {
    data: rows.map((row) => ({
      kind: 'post' as const,
      id: row.id,
      authorId: row.author_id,
      body: row.body,
      createdAt: row.created_at,
    })),
    error: null,
  };
}

/** Liste les commentaires de posts modérés. */
export async function listFlaggedPostComments(limit = 50): Promise<FlaggedListResult> {
  const { data, error } = await supabase
    .from('post_comments')
    .select('id, post_id, author_id, body, created_at')
    .eq('is_flagged', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    return { data: [], error };
  }
  const rows = data ?? [];
  return {
    data: rows.map((row) => ({
      kind: 'post_comment' as const,
      id: row.id,
      authorId: row.author_id,
      body: row.body,
      createdAt: row.created_at,
      postId: row.post_id,
    })),
    error: null,
  };
}

/** Liste les commentaires d'articles modérés. */
export async function listFlaggedComments(limit = 50): Promise<FlaggedListResult> {
  const { data, error } = await supabase
    .from('comments')
    .select('id, article_id, author_id, body, created_at')
    .eq('is_flagged', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    return { data: [], error };
  }
  const rows = data ?? [];
  return {
    data: rows.map((row) => ({
      kind: 'comment' as const,
      id: row.id,
      authorId: row.author_id,
      body: row.body,
      createdAt: row.created_at,
      articleId: row.article_id,
    })),
    error: null,
  };
}

/**
 * Lève le flag de modération. Pour les articles on repasse `status = 'published'` ;
 * pour les posts/commentaires on flip `is_flagged = false`. RLS exige
 * `public.is_admin(auth.uid())`.
 */
export async function unflagItem(
  kind: FlaggedKind,
  id: string,
): Promise<{ error: PostgrestError | null }> {
  if (kind === 'article') {
    const { error } = await supabase
      .from('articles')
      .update({ status: 'published' })
      .eq('id', id);
    return { error };
  }
  const table =
    kind === 'post' ? 'posts' : kind === 'comment' ? 'comments' : 'post_comments';
  const { error } = await supabase.from(table).update({ is_flagged: false }).eq('id', id);
  return { error };
}

/**
 * Supprime définitivement un contenu modéré. RLS exige
 * `public.is_admin(auth.uid())` (et la policy `*_delete_admin` côté table).
 * Toute action admin doit être historisée via `logAdminAction`.
 */
export async function deleteFlaggedItem(
  kind: FlaggedKind,
  id: string,
): Promise<{ error: PostgrestError | null }> {
  const table =
    kind === 'article'
      ? 'articles'
      : kind === 'post'
      ? 'posts'
      : kind === 'comment'
      ? 'comments'
      : 'post_comments';
  const { error } = await supabase.from(table).delete().eq('id', id);
  return { error };
}

export interface LogAdminActionInput {
  actorId: string;
  action: string;
  targetTable?: string | null | undefined;
  targetId?: string | null | undefined;
  payload?: Json | undefined;
}

/**
 * Historise une action admin dans `admin_logs`. RLS exige
 * `public.is_admin(auth.uid())` (cf. policy `admin_logs_admin`). À appeler
 * systématiquement après toute action admin sensible (modération, gestion
 * communes, campagne email…).
 */
export async function logAdminAction(input: LogAdminActionInput): Promise<AdminLogResult> {
  const insert: AdminLogInsert = {
    actor_id: input.actorId,
    action: input.action,
    target_table: input.targetTable ?? null,
    target_id: input.targetId ?? null,
    payload: input.payload ?? {},
  };
  const { data, error } = await supabase
    .from('admin_logs')
    .insert(insert)
    .select('*')
    .maybeSingle();
  return { data, error };
}

/** Liste les derniers logs admin. RLS : admin only. */
export async function listAdminLogs(limit = 50): Promise<AdminLogListResult> {
  const { data, error } = await supabase
    .from('admin_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data: data ?? [], error };
}

/** Liste les campagnes email. RLS : admin only. */
export async function listEmailCampaigns(limit = 100): Promise<EmailCampaignListResult> {
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data: data ?? [], error };
}

/** Crée une campagne email (draft par défaut). RLS : admin only. */
export async function createEmailCampaign(
  input: CreateEmailCampaignInput,
): Promise<EmailCampaignResult> {
  const issues = validateEmailCampaignInput(input);
  if (issues.length > 0) {
    return {
      data: null,
      error: new PostgrestError({
        message: issues.map((i) => i.message).join(' '),
        details: '',
        hint: issues[0]?.field ?? '',
        code: 'EMAIL_CAMPAIGN_VALIDATION',
      }),
    };
  }
  const insert: EmailCampaignInsert = {
    author_id: input.authorId,
    subject: input.subject.trim(),
    body_html: input.bodyHtml.trim(),
    audience: input.audience.trim(),
    status: input.status ?? 'draft',
    scheduled_for: input.scheduledFor ?? null,
  };
  const { data, error } = await supabase
    .from('email_campaigns')
    .insert(insert)
    .select('*')
    .maybeSingle();
  return { data, error };
}

/** Met à jour le statut d'une campagne email (passage en queued, sent, etc.). */
export async function updateEmailCampaignStatus(
  id: string,
  status: EmailCampaignStatus,
): Promise<EmailCampaignResult> {
  if (!EMAIL_CAMPAIGN_STATUSES.includes(status)) {
    return {
      data: null,
      error: new PostgrestError({
        message: 'Statut de campagne invalide.',
        details: '',
        hint: 'status',
        code: 'EMAIL_CAMPAIGN_STATUS',
      }),
    };
  }
  const update: EmailCampaignUpdate = { status };
  if (status === 'sent') {
    update.sent_at = new Date().toISOString();
  }
  const { data, error } = await supabase
    .from('email_campaigns')
    .update(update)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  return { data, error };
}
