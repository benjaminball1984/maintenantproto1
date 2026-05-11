import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { listPosts, type ListPostsParams, type PostRow } from '@/lib/social';

export type PostsStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UsePostsResult {
  posts: PostRow[];
  status: PostsStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

export function usePosts(params: ListPostsParams = {}): UsePostsResult {
  const { authorIds, visibility, search, limit } = params;
  const filterKey = JSON.stringify({ authorIds, visibility, search, limit });

  const [posts, setPosts] = useState<PostRow[]>([]);
  const [status, setStatus] = useState<PostsStatus>('loading');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [trackedKey, setTrackedKey] = useState<string>(filterKey);
  if (trackedKey !== filterKey) {
    setTrackedKey(filterKey);
    setPosts([]);
    setError(null);
    setStatus('loading');
  }

  const fetchPosts = useCallback(async (current: ListPostsParams) => {
    const { data, error: err } = await listPosts(current);
    if (err) {
      setPosts([]);
      setError(err);
      setStatus('error');
      return;
    }
    setPosts(data);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchPosts({ authorIds, visibility, search, limit });
    });
  }, [fetchPosts, authorIds, visibility, search, limit]);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    await fetchPosts({ authorIds, visibility, search, limit });
  }, [fetchPosts, authorIds, visibility, search, limit]);

  return { posts, status, error, refresh };
}
