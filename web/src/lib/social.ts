import { PostgrestError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type PostRow = Database['public']['Tables']['posts']['Row'];
export type PostInsert = Database['public']['Tables']['posts']['Insert'];
export type FollowRow = Database['public']['Tables']['follows']['Row'];
export type FollowInsert = Database['public']['Tables']['follows']['Insert'];
export type PostVisibility = PostRow['visibility'];

/** Validation des posts (cf. HANDOFF §10 Sprint 4). */
export const POST_BODY_MIN = 1;
export const POST_BODY_MAX = 1000;
export const POST_MEDIA_MAX = 4;

const VISIBILITIES: readonly PostVisibility[] = ['public', 'members', 'private'];

export interface ListPostsParams {
  authorIds?: readonly string[] | undefined;
  visibility?: PostVisibility | undefined;
  search?: string | undefined;
  limit?: number | undefined;
}

export interface ListPostsResult {
  data: PostRow[];
  error: PostgrestError | null;
}

export interface PostResult {
  data: PostRow | null;
  error: PostgrestError | null;
}

export interface FollowResult {
  data: FollowRow | null;
  error: PostgrestError | null;
}

export interface FollowListResult {
  data: FollowRow[];
  error: PostgrestError | null;
}

export interface CreatePostInput {
  authorId: string;
  body: string;
  mediaUrls?: readonly string[] | undefined;
  visibility?: PostVisibility | undefined;
}

export type CreatePostField = 'body' | 'mediaUrls' | 'visibility';

export interface ValidationIssue {
  field: CreatePostField;
  message: string;
}

export function validatePostInput(input: CreatePostInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const body = input.body.trim();
  if (body.length < POST_BODY_MIN || body.length > POST_BODY_MAX) {
    issues.push({
      field: 'body',
      message: `Le post doit faire entre ${POST_BODY_MIN} et ${POST_BODY_MAX} caractères.`,
    });
  }
  const media = input.mediaUrls ?? [];
  if (media.length > POST_MEDIA_MAX) {
    issues.push({
      field: 'mediaUrls',
      message: `Vous ne pouvez pas attacher plus de ${POST_MEDIA_MAX} médias par post.`,
    });
  }
  if (input.visibility && !VISIBILITIES.includes(input.visibility)) {
    issues.push({ field: 'visibility', message: 'Visibilité invalide.' });
  }
  return issues;
}

/**
 * Liste les posts non flaggés. Tri par `created_at DESC`. `authorIds` filtre
 * le feed sur un ensemble d'auteurs (utilisé pour le mode « suivis »). Si
 * `authorIds` est fourni mais vide, on renvoie immédiatement une liste vide
 * sans interroger Supabase — sinon `.in('author_id', [])` produit un SQL
 * invalide côté PostgREST.
 */
export async function listPosts(params: ListPostsParams = {}): Promise<ListPostsResult> {
  if (params.authorIds && params.authorIds.length === 0) {
    return { data: [], error: null };
  }
  const limit = params.limit ?? 50;
  let query = supabase
    .from('posts')
    .select('*')
    .eq('is_flagged', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (params.authorIds && params.authorIds.length > 0) {
    query = query.in('author_id', [...params.authorIds]);
  }
  if (params.visibility) {
    query = query.eq('visibility', params.visibility);
  }
  const search = params.search?.trim();
  if (search) {
    const escaped = search.replace(/[%_,]/g, (m) => `\\${m}`);
    query = query.ilike('body', `%${escaped}%`);
  }
  const { data, error } = await query;
  return { data: data ?? [], error };
}

/** Lit un post par ID. */
export async function getPost(id: string): Promise<PostResult> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return { data, error };
}

/** Crée un post. RLS impose `auth.uid() = author_id`. */
export async function createPost(input: CreatePostInput): Promise<PostResult> {
  const issues = validatePostInput(input);
  if (issues.length > 0) {
    return {
      data: null,
      error: new PostgrestError({
        message: issues.map((i) => i.message).join(' '),
        details: '',
        hint: issues[0]?.field ?? '',
        code: 'POST_VALIDATION',
      }),
    };
  }
  const mediaUrls = input.mediaUrls ? [...input.mediaUrls] : [];
  const insert: PostInsert = {
    author_id: input.authorId,
    body: input.body.trim(),
    media_urls: mediaUrls,
    visibility: input.visibility ?? 'public',
  };
  const { data, error } = await supabase
    .from('posts')
    .insert(insert)
    .select('*')
    .maybeSingle();
  return { data, error };
}

/**
 * Crée un lien d'abonnement (follower -> followee). Empêche localement
 * l'auto-follow ; côté DB, le CHECK `follower_id <> followee_id` impose
 * la même règle.
 */
export async function followUser(
  followerId: string,
  followeeId: string,
): Promise<FollowResult> {
  if (followerId === followeeId) {
    return {
      data: null,
      error: new PostgrestError({
        message: 'Vous ne pouvez pas vous suivre vous-même.',
        details: '',
        hint: 'followeeId',
        code: 'FOLLOW_SELF',
      }),
    };
  }
  const insert: FollowInsert = {
    follower_id: followerId,
    followee_id: followeeId,
  };
  const { data, error } = await supabase
    .from('follows')
    .insert(insert)
    .select('*')
    .maybeSingle();
  return { data, error };
}

/** Supprime le lien d'abonnement. RLS impose `auth.uid() = follower_id`. */
export async function unfollowUser(
  followerId: string,
  followeeId: string,
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('followee_id', followeeId);
  return { error };
}

/** Liste les utilisateurs suivis par `followerId`. */
export async function listFollowing(followerId: string): Promise<FollowListResult> {
  const { data, error } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', followerId)
    .order('created_at', { ascending: false });
  return { data: data ?? [], error };
}

/** Liste les abonnés de `followeeId`. */
export async function listFollowers(followeeId: string): Promise<FollowListResult> {
  const { data, error } = await supabase
    .from('follows')
    .select('*')
    .eq('followee_id', followeeId)
    .order('created_at', { ascending: false });
  return { data: data ?? [], error };
}
