import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { getLending, type LendingRow } from '@/lib/lending';

export type LendingItemStatus = 'idle' | 'loading' | 'ready' | 'notfound' | 'error';

export interface UseLendingItemResult {
  lending: LendingRow | null;
  status: LendingItemStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

/** Lit une annonce de prêt par ID. */
export function useLendingItem(id: string | undefined): UseLendingItemResult {
  const [lending, setLending] = useState<LendingRow | null>(null);
  const [status, setStatus] = useState<LendingItemStatus>(id ? 'loading' : 'idle');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [previousId, setPreviousId] = useState<string | undefined>(id);
  if (previousId !== id) {
    setPreviousId(id);
    setLending(null);
    setError(null);
    setStatus(id ? 'loading' : 'idle');
  }

  const fetchItem = useCallback(async (currentId: string) => {
    const { data, error: fetchError } = await getLending(currentId);
    if (fetchError) {
      setLending(null);
      setError(fetchError);
      setStatus('error');
      return;
    }
    if (!data) {
      setLending(null);
      setStatus('notfound');
      return;
    }
    setLending(data);
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

  return { lending, status, error, refresh };
}
