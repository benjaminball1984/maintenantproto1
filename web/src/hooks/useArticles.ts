import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { listArticles, type ArticleRow, type ListArticlesParams } from '@/lib/media';

export type ArticlesStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseArticlesResult {
  articles: ArticleRow[];
  status: ArticlesStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

export function useArticles(params: ListArticlesParams = {}): UseArticlesResult {
  const { search, format, limit } = params;
  const filterKey = JSON.stringify({ search, format, limit });

  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [status, setStatus] = useState<ArticlesStatus>('loading');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [trackedKey, setTrackedKey] = useState<string>(filterKey);
  if (trackedKey !== filterKey) {
    setTrackedKey(filterKey);
    setArticles([]);
    setError(null);
    setStatus('loading');
  }

  const fetchArticles = useCallback(async (current: ListArticlesParams) => {
    const { data, error: err } = await listArticles(current);
    if (err) {
      setArticles([]);
      setError(err);
      setStatus('error');
      return;
    }
    setArticles(data);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchArticles({ search, format, limit });
    });
  }, [fetchArticles, search, format, limit]);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    await fetchArticles({ search, format, limit });
  }, [fetchArticles, search, format, limit]);

  return { articles, status, error, refresh };
}
