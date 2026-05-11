import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { listLending, type LendingRow, type ListLendingParams } from '@/lib/lending';

export type LendingStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseLendingResult {
  lending: LendingRow[];
  status: LendingStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

/**
 * Charge la liste des annonces de prêt. Reset des états quand les filtres
 * changent.
 */
export function useLending(params: ListLendingParams = {}): UseLendingResult {
  const { city, category, search, maxCost, limit } = params;
  const filterKey = JSON.stringify({ city, category, search, maxCost, limit });

  const [lending, setLending] = useState<LendingRow[]>([]);
  const [status, setStatus] = useState<LendingStatus>('loading');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [trackedKey, setTrackedKey] = useState<string>(filterKey);
  if (trackedKey !== filterKey) {
    setTrackedKey(filterKey);
    setLending([]);
    setError(null);
    setStatus('loading');
  }

  const fetchLending = useCallback(async (current: ListLendingParams) => {
    const { data, error: err } = await listLending(current);
    if (err) {
      setLending([]);
      setError(err);
      setStatus('error');
      return;
    }
    setLending(data);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchLending({ city, category, search, maxCost, limit });
    });
  }, [fetchLending, city, category, search, maxCost, limit]);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    await fetchLending({ city, category, search, maxCost, limit });
  }, [fetchLending, city, category, search, maxCost, limit]);

  return { lending, status, error, refresh };
}
