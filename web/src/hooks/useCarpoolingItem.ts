import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { getCarpooling, type CarpoolingRow } from '@/lib/carpooling';

export type CarpoolingItemStatus = 'idle' | 'loading' | 'ready' | 'notfound' | 'error';

export interface UseCarpoolingItemResult {
  carpooling: CarpoolingRow | null;
  status: CarpoolingItemStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

/**
 * Lit un covoiturage par ID. Même pattern que `useHousingItem`.
 */
export function useCarpoolingItem(id: string | undefined): UseCarpoolingItemResult {
  const [carpooling, setCarpooling] = useState<CarpoolingRow | null>(null);
  const [status, setStatus] = useState<CarpoolingItemStatus>(id ? 'loading' : 'idle');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [previousId, setPreviousId] = useState<string | undefined>(id);
  if (previousId !== id) {
    setPreviousId(id);
    setCarpooling(null);
    setError(null);
    setStatus(id ? 'loading' : 'idle');
  }

  const fetchItem = useCallback(async (currentId: string) => {
    const { data, error: fetchError } = await getCarpooling(currentId);
    if (fetchError) {
      setCarpooling(null);
      setError(fetchError);
      setStatus('error');
      return;
    }
    if (!data) {
      setCarpooling(null);
      setStatus('notfound');
      return;
    }
    setCarpooling(data);
    setStatus('ready');
  }, []);

  useEffect(() => {
    if (!id) return;
    const currentId = id;
    queueMicrotask(() => {
      void fetchItem(currentId);
    });
  }, [id, fetchItem]);

  const refresh = useCallback(async () => {
    if (!id) return;
    setStatus('loading');
    setError(null);
    await fetchItem(id);
  }, [id, fetchItem]);

  return { carpooling, status, error, refresh };
}
