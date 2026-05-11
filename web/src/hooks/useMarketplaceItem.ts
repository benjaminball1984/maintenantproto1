import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { getMarketplaceItem, type MarketplaceItemRow } from '@/lib/marketplace';

export type MarketplaceItemStatus = 'idle' | 'loading' | 'ready' | 'notfound' | 'error';

export interface UseMarketplaceItemResult {
  item: MarketplaceItemRow | null;
  status: MarketplaceItemStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

export function useMarketplaceItem(id: string | undefined): UseMarketplaceItemResult {
  const [item, setItem] = useState<MarketplaceItemRow | null>(null);
  const [status, setStatus] = useState<MarketplaceItemStatus>(id ? 'loading' : 'idle');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [previousId, setPreviousId] = useState<string | undefined>(id);
  if (previousId !== id) {
    setPreviousId(id);
    setItem(null);
    setError(null);
    setStatus(id ? 'loading' : 'idle');
  }

  const fetchItem = useCallback(async (currentId: string) => {
    const { data, error: fetchError } = await getMarketplaceItem(currentId);
    if (fetchError) {
      setItem(null);
      setError(fetchError);
      setStatus('error');
      return;
    }
    if (!data) {
      setItem(null);
      setStatus('notfound');
      return;
    }
    setItem(data);
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

  return { item, status, error, refresh };
}
