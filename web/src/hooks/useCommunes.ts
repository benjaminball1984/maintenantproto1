import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { listCommunes, type CommuneRow, type ListCommunesParams } from '@/lib/communes';

export type CommunesStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseCommunesResult {
  communes: CommuneRow[];
  status: CommunesStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

export function useCommunes(params: ListCommunesParams = {}): UseCommunesResult {
  const { search, city, limit } = params;
  const filterKey = JSON.stringify({ search, city, limit });

  const [communes, setCommunes] = useState<CommuneRow[]>([]);
  const [status, setStatus] = useState<CommunesStatus>('loading');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [trackedKey, setTrackedKey] = useState<string>(filterKey);
  if (trackedKey !== filterKey) {
    setTrackedKey(filterKey);
    setCommunes([]);
    setError(null);
    setStatus('loading');
  }

  const fetchCommunes = useCallback(async (current: ListCommunesParams) => {
    const { data, error: err } = await listCommunes(current);
    if (err) {
      setCommunes([]);
      setError(err);
      setStatus('error');
      return;
    }
    setCommunes(data);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchCommunes({ search, city, limit });
    });
  }, [fetchCommunes, search, city, limit]);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    await fetchCommunes({ search, city, limit });
  }, [fetchCommunes, search, city, limit]);

  return { communes, status, error, refresh };
}
