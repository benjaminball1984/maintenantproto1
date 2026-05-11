import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { listSel, type ListSelParams, type SelOfferRow } from '@/lib/sel';

export type SelStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseSelResult {
  offers: SelOfferRow[];
  status: SelStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

export function useSel(params: ListSelParams = {}): UseSelResult {
  const { city, category, search, limit } = params;
  const filterKey = JSON.stringify({ city, category, search, limit });

  const [offers, setOffers] = useState<SelOfferRow[]>([]);
  const [status, setStatus] = useState<SelStatus>('loading');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [trackedKey, setTrackedKey] = useState<string>(filterKey);
  if (trackedKey !== filterKey) {
    setTrackedKey(filterKey);
    setOffers([]);
    setError(null);
    setStatus('loading');
  }

  const fetchOffers = useCallback(async (current: ListSelParams) => {
    const { data, error: err } = await listSel(current);
    if (err) {
      setOffers([]);
      setError(err);
      setStatus('error');
      return;
    }
    setOffers(data);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchOffers({ city, category, search, limit });
    });
  }, [fetchOffers, city, category, search, limit]);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    await fetchOffers({ city, category, search, limit });
  }, [fetchOffers, city, category, search, limit]);

  return { offers, status, error, refresh };
}
