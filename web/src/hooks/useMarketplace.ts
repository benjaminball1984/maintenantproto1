import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import {
  listMarketplace,
  type ListMarketplaceParams,
  type MarketplaceItemRow,
} from '@/lib/marketplace';

export type MarketplaceStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseMarketplaceResult {
  items: MarketplaceItemRow[];
  status: MarketplaceStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

export function useMarketplace(params: ListMarketplaceParams = {}): UseMarketplaceResult {
  const { city, category, search, maxPriceEur, limit } = params;
  const filterKey = JSON.stringify({ city, category, search, maxPriceEur, limit });

  const [items, setItems] = useState<MarketplaceItemRow[]>([]);
  const [status, setStatus] = useState<MarketplaceStatus>('loading');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [trackedKey, setTrackedKey] = useState<string>(filterKey);
  if (trackedKey !== filterKey) {
    setTrackedKey(filterKey);
    setItems([]);
    setError(null);
    setStatus('loading');
  }

  const fetchItems = useCallback(async (current: ListMarketplaceParams) => {
    const { data, error: err } = await listMarketplace(current);
    if (err) {
      setItems([]);
      setError(err);
      setStatus('error');
      return;
    }
    setItems(data);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchItems({ city, category, search, maxPriceEur, limit });
    });
  }, [fetchItems, city, category, search, maxPriceEur, limit]);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    await fetchItems({ city, category, search, maxPriceEur, limit });
  }, [fetchItems, city, category, search, maxPriceEur, limit]);

  return { items, status, error, refresh };
}
