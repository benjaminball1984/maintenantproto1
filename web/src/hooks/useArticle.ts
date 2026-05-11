import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { getArticleBySlug, type ArticleRow } from '@/lib/media';

export type ArticleStatus = 'idle' | 'loading' | 'ready' | 'notfound' | 'error';

export interface UseArticleResult {
  article: ArticleRow | null;
  status: ArticleStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

export function useArticle(slug: string | undefined): UseArticleResult {
  const [article, setArticle] = useState<ArticleRow | null>(null);
  const [status, setStatus] = useState<ArticleStatus>(slug ? 'loading' : 'idle');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [previousSlug, setPreviousSlug] = useState<string | undefined>(slug);
  if (previousSlug !== slug) {
    setPreviousSlug(slug);
    setArticle(null);
    setError(null);
    setStatus(slug ? 'loading' : 'idle');
  }

  const fetchArticle = useCallback(async (currentSlug: string) => {
    const { data, error: err } = await getArticleBySlug(currentSlug);
    if (err) {
      setArticle(null);
      setError(err);
      setStatus('error');
      return;
    }
    if (!data) {
      setArticle(null);
      setStatus('notfound');
      return;
    }
    setArticle(data);
    setStatus('ready');
  }, []);

  useEffect(() => {
    if (!slug) return;
    const current = slug;
    queueMicrotask(() => {
      void fetchArticle(current);
    });
  }, [slug, fetchArticle]);

  const refresh = useCallback(async () => {
    if (!slug) return;
    setStatus('loading');
    setError(null);
    await fetchArticle(slug);
  }, [slug, fetchArticle]);

  return { article, status, error, refresh };
}
