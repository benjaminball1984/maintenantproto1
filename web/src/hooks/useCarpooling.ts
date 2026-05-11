import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import {
  listCarpooling,
  type CarpoolingRow,
  type ListCarpoolingParams,
} from '@/lib/carpooling';

export type CarpoolingStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseCarpoolingResult {
  carpooling: CarpoolingRow[];
  status: CarpoolingStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

/**
 * Charge la liste des covoiturages publics. Reset des états quand les filtres
 * changent.
 */
export function useCarpooling(params: ListCarpoolingParams = {}): UseCarpoolingResult {
  const { from, to, search, departsAfter, departsBefore, limit } = params;
  const filterKey = JSON.stringify({ from, to, search, departsAfter, departsBefore, limit });

  const [carpooling, setCarpooling] = useState<CarpoolingRow[]>([]);
  const [status, setStatus] = useState<CarpoolingStatus>('loading');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [trackedKey, setTrackedKey] = useState<string>(filterKey);
  if (trackedKey !== filterKey) {
    setTrackedKey(filterKey);
    setCarpooling([]);
    setError(null);
    setStatus('loading');
  }

  const fetchCarpooling = useCallback(async (current: ListCarpoolingParams) => {
    const { data, error: err } = await listCarpooling(current);
    if (err) {
      setCarpooling([]);
      setError(err);
      setStatus('error');
      return;
    }
    setCarpooling(data);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchCarpooling({ from, to, search, departsAfter, departsBefore, limit });
    });
  }, [fetchCarpooling, from, to, search, departsAfter, departsBefore, limit]);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    await fetchCarpooling({ from, to, search, departsAfter, departsBefore, limit });
  }, [fetchCarpooling, from, to, search, departsAfter, departsBefore, limit]);

  return { carpooling, status, error, refresh };
}
