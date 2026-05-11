import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { getSelOffer, type SelOfferRow } from '@/lib/sel';

export type SelItemStatus = 'idle' | 'loading' | 'ready' | 'notfound' | 'error';

export interface UseSelItemResult {
  offer: SelOfferRow | null;
  status: SelItemStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

export function useSelItem(id: string | undefined): UseSelItemResult {
  const [offer, setOffer] = useState<SelOfferRow | null>(null);
  const [status, setStatus] = useState<SelItemStatus>(id ? 'loading' : 'idle');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [previousId, setPreviousId] = useState<string | undefined>(id);
  if (previousId !== id) {
    setPreviousId(id);
    setOffer(null);
    setError(null);
    setStatus(id ? 'loading' : 'idle');
  }

  const fetchItem = useCallback(async (currentId: string) => {
    const { data, error: fetchError } = await getSelOffer(currentId);
    if (fetchError) {
      setOffer(null);
      setError(fetchError);
      setStatus('error');
      return;
    }
    if (!data) {
      setOffer(null);
      setStatus('notfound');
      return;
    }
    setOffer(data);
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

  return { offer, status, error, refresh };
}
