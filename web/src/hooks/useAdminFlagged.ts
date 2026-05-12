import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import {
  listFlaggedArticles,
  listFlaggedComments,
  listFlaggedPostComments,
  listFlaggedPosts,
  type FlaggedItem,
} from '@/lib/admin';

export type AdminFlaggedStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseAdminFlaggedResult {
  items: FlaggedItem[];
  status: AdminFlaggedStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

/**
 * Agrège la file de modération de quatre tables (articles `status=flagged`,
 * `posts.is_flagged`, `comments.is_flagged`, `post_comments.is_flagged`),
 * triée par `created_at` DESC. `enabled` permet de différer la requête tant
 * qu'on n'est pas certain que l'utilisateur est admin.
 */
export function useAdminFlagged(enabled: boolean): UseAdminFlaggedResult {
  const [items, setItems] = useState<FlaggedItem[]>([]);
  const [status, setStatus] = useState<AdminFlaggedStatus>(enabled ? 'loading' : 'idle');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [previousEnabled, setPreviousEnabled] = useState<boolean>(enabled);
  if (previousEnabled !== enabled) {
    setPreviousEnabled(enabled);
    setItems([]);
    setError(null);
    setStatus(enabled ? 'loading' : 'idle');
  }

  const fetchFlagged = useCallback(async () => {
    const [articles, posts, postComments, comments] = await Promise.all([
      listFlaggedArticles(),
      listFlaggedPosts(),
      listFlaggedPostComments(),
      listFlaggedComments(),
    ]);
    const firstError =
      articles.error ?? posts.error ?? postComments.error ?? comments.error ?? null;
    if (firstError) {
      setItems([]);
      setError(firstError);
      setStatus('error');
      return;
    }
    const merged = [
      ...articles.data,
      ...posts.data,
      ...postComments.data,
      ...comments.data,
    ].sort((a, b) => (a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0));
    setItems(merged);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    if (!enabled) return;
    queueMicrotask(() => {
      void fetchFlagged();
    });
  }, [enabled, fetchFlagged]);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setStatus('loading');
    setError(null);
    await fetchFlagged();
  }, [enabled, fetchFlagged]);

  return { items, status, error, refresh };
}
