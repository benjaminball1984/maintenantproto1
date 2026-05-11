import { PostgrestError } from '@supabase/supabase-js';

import { slugify } from '@/lib/slug';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type ArticleRow = Database['public']['Tables']['articles']['Row'];
export type ArticleInsert = Database['public']['Tables']['articles']['Insert'];
export type CommentRow = Database['public']['Tables']['comments']['Row'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];
export type ReactionRow = Database['public']['Tables']['reactions']['Row'];
export type ReactionInsert = Database['public']['Tables']['reactions']['Insert'];

export type ArticleFormat = 'article' | 'video' | 'podcast' | 'photo' | 'enquete';
export type ReactionKind = 'like' | 'support' | 'disagree' | 'curious' | 'outrage';

const ARTICLE_FORMATS: readonly ArticleFormat[] = [
  'article',
  'video',
  'podcast',
  'photo',
  'enquete',
];
const REACTION_KINDS: readonly ReactionKind[] = [
  'like',
  'support',
  'disagree',
  'curious',
  'outrage',
];

/** Validation des champs (cf. HANDOFF §10 Sprint 4). */
export const ARTICLE_TITLE_MIN = 8;
export const ARTICLE_TITLE_MAX = 140;
export const ARTICLE_SUMMARY_MIN = 40;
export const ARTICLE_SUMMARY_MAX = 280;
export const ARTICLE_BODY_MIN = 200;
export const ARTICLE_BODY_MAX = 40000;
export const COMMENT_BODY_MIN = 1;
export const COMMENT_BODY_MAX = 2000;

export interface ListArticlesParams {
  search?: string | undefined;
  format?: ArticleFormat | undefined;
  limit?: number | undefined;
}

export interface ListArticlesResult {
  data: ArticleRow[];
  error: PostgrestError | null;
}

export interface ArticleResult {
  data: ArticleRow | null;
  error: PostgrestError | null;
}

export interface CommentResult {
  data: CommentRow | null;
  error: PostgrestError | null;
}

export interface CommentListResult {
  data: CommentRow[];
  error: PostgrestError | null;
}

export interface ReactionResult {
  data: ReactionRow | null;
  error: PostgrestError | null;
}

export interface ReactionListResult {
  data: ReactionRow[];
  error: PostgrestError | null;
}

export interface CreateArticleInput {
  authorId: string;
  title: string;
  summary: string;
  body: string;
  format: ArticleFormat;
  coverUrl?: string | null | undefined;
}

export interface CreateCommentInput {
  articleId: string;
  authorId: string;
  body: string;
}

export type CreateArticleField = 'title' | 'summary' | 'body' | 'format' | 'coverUrl';
export type CreateCommentField = 'body';

export interface ArticleValidationIssue {
  field: CreateArticleField;
  message: string;
}

export interface CommentValidationIssue {
  field: CreateCommentField;
  message: string;
}

export function validateArticleInput(input: CreateArticleInput): ArticleValidationIssue[] {
  const issues: ArticleValidationIssue[] = [];
  const title = input.title.trim();
  if (title.length < ARTICLE_TITLE_MIN || title.length > ARTICLE_TITLE_MAX) {
    issues.push({
      field: 'title',
      message: `Le titre doit faire entre ${ARTICLE_TITLE_MIN} et ${ARTICLE_TITLE_MAX} caractères.`,
    });
  }
  const summary = input.summary.trim();
  if (summary.length < ARTICLE_SUMMARY_MIN || summary.length > ARTICLE_SUMMARY_MAX) {
    issues.push({
      field: 'summary',
      message: `Le résumé doit faire entre ${ARTICLE_SUMMARY_MIN} et ${ARTICLE_SUMMARY_MAX} caractères.`,
    });
  }
  const body = input.body.trim();
  if (body.length < ARTICLE_BODY_MIN || body.length > ARTICLE_BODY_MAX) {
    issues.push({
      field: 'body',
      message: `L’article doit faire entre ${ARTICLE_BODY_MIN} et ${ARTICLE_BODY_MAX} caractères.`,
    });
  }
  if (!ARTICLE_FORMATS.includes(input.format)) {
    issues.push({ field: 'format', message: 'Format d’article invalide.' });
  }
  return issues;
}

export function validateCommentInput(input: CreateCommentInput): CommentValidationIssue[] {
  const issues: CommentValidationIssue[] = [];
  const body = input.body.trim();
  if (body.length < COMMENT_BODY_MIN || body.length > COMMENT_BODY_MAX) {
    issues.push({
      field: 'body',
      message: `Le commentaire doit faire entre ${COMMENT_BODY_MIN} et ${COMMENT_BODY_MAX} caractères.`,
    });
  }
  return issues;
}

/**
 * Liste les articles publiés. Tri par `published_at DESC NULLS LAST` puis
 * `created_at DESC`. Filtre `search` cible `title`, `summary` et `body`.
 */
export async function listArticles(
  params: ListArticlesParams = {},
): Promise<ListArticlesResult> {
  const limit = params.limit ?? 50;
  let query = supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (params.format) {
    query = query.eq('format', params.format);
  }
  const search = params.search?.trim();
  if (search) {
    const escaped = search.replace(/[%_,]/g, (m) => `\\${m}`);
    query = query.or(
      `title.ilike.%${escaped}%,summary.ilike.%${escaped}%,body.ilike.%${escaped}%`,
    );
  }
  const { data, error } = await query;
  return { data: data ?? [], error };
}

/** Lit un article par slug (URLs `/media/:slug`). */
export async function getArticleBySlug(slug: string): Promise<ArticleResult> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  return { data, error };
}

/**
 * Crée un article. La table impose un slug UNIQUE NOT NULL — on retente
 * sur 23505 avec un suffixe numérique, comme pour `campaigns` et
 * `crowdfunding`.
 */
export async function createArticle(input: CreateArticleInput): Promise<ArticleResult> {
  const issues = validateArticleInput(input);
  if (issues.length > 0) {
    return {
      data: null,
      error: new PostgrestError({
        message: issues.map((i) => i.message).join(' '),
        details: '',
        hint: issues[0]?.field ?? '',
        code: 'ARTICLE_VALIDATION',
      }),
    };
  }
  const coverUrl = input.coverUrl?.trim();
  const baseSlug = slugify(input.title) || 'article';
  let attempt = 0;
  while (attempt < 5) {
    const suffix = attempt === 0 ? '' : `-${attempt + 1}`;
    const slug = `${baseSlug}${suffix}`.slice(0, 140);
    const insert: ArticleInsert = {
      author_id: input.authorId,
      title: input.title.trim(),
      slug,
      summary: input.summary.trim(),
      body: input.body.trim(),
      format: input.format,
      cover_url: coverUrl ? coverUrl : null,
      status: 'published',
      published_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('articles')
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
      code: 'ARTICLE_SLUG_COLLISION',
    }),
  };
}

/** Liste les commentaires d'un article (non masqués), tri ASC chronologique. */
export async function listComments(articleId: string): Promise<CommentListResult> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('article_id', articleId)
    .eq('is_flagged', false)
    .order('created_at', { ascending: true });
  return { data: data ?? [], error };
}

/** Poste un commentaire. RLS impose `auth.uid() = author_id`. */
export async function createComment(input: CreateCommentInput): Promise<CommentResult> {
  const issues = validateCommentInput(input);
  if (issues.length > 0) {
    return {
      data: null,
      error: new PostgrestError({
        message: issues.map((i) => i.message).join(' '),
        details: '',
        hint: issues[0]?.field ?? '',
        code: 'COMMENT_VALIDATION',
      }),
    };
  }
  const insert: CommentInsert = {
    article_id: input.articleId,
    author_id: input.authorId,
    body: input.body.trim(),
  };
  const { data, error } = await supabase
    .from('comments')
    .insert(insert)
    .select('*')
    .maybeSingle();
  return { data, error };
}

/** Liste toutes les réactions d'un article (pour compter les types). */
export async function listReactions(articleId: string): Promise<ReactionListResult> {
  const { data, error } = await supabase
    .from('reactions')
    .select('*')
    .eq('article_id', articleId);
  return { data: data ?? [], error };
}

/**
 * Ajoute une réaction. La table impose `UNIQUE (article_id, user_id, kind)` :
 * un même utilisateur peut avoir plusieurs réactions de types différents
 * mais pas deux fois la même.
 */
export async function react(
  articleId: string,
  userId: string,
  kind: ReactionKind,
): Promise<ReactionResult> {
  if (!REACTION_KINDS.includes(kind)) {
    return {
      data: null,
      error: new PostgrestError({
        message: 'Type de réaction invalide.',
        details: '',
        hint: 'kind',
        code: 'REACTION_KIND',
      }),
    };
  }
  const insert: ReactionInsert = {
    article_id: articleId,
    user_id: userId,
    kind,
  };
  const { data, error } = await supabase
    .from('reactions')
    .insert(insert)
    .select('*')
    .maybeSingle();
  return { data, error };
}

/** Retire une réaction. RLS impose `auth.uid() = user_id`. */
export async function unreact(
  articleId: string,
  userId: string,
  kind: ReactionKind,
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('reactions')
    .delete()
    .eq('article_id', articleId)
    .eq('user_id', userId)
    .eq('kind', kind);
  return { error };
}
