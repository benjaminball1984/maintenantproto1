import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { listHousing, type HousingRow, type ListHousingParams } from '@/lib/housing';

export type HousingStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseHousingResult {
  housing: HousingRow[];
  status: HousingStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

/**
 * Charge la liste des hébergements publics avec filtres optionnels. Le hook
 * se ré-exécute si l'un des paramètres change (reset des états locaux pendant
 * le render — pattern aligné sur `useCampaigns`).
 */
export function useHousing(params: ListHousingParams = {}): UseHousingResult {
  const { city, search, capacityMin, availableFrom, availableTo, limit } = params;
  const filterKey = JSON.stringify({ city, search, capacityMin, availableFrom, availableTo, limit });

  const [housing, setHousing] = useState<HousingRow[]>([]);
  const [status, setStatus] = useState<HousingStatus>('loading');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [trackedKey, setTrackedKey] = useState<string>(filterKey);
  if (trackedKey !== filterKey) {
    setTrackedKey(filterKey);
    setHousing([]);
    setError(null);
    setStatus('loading');
  }

  const fetchHousing = useCallback(async (current: ListHousingParams) => {
    const { data, error: err } = await listHousing(current);
    if (err) {
      setHousing([]);
      setError(err);
      setStatus('error');
      return;
    }
    setHousing(data);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchHousing({ city, search, capacityMin, availableFrom, availableTo, limit });
    });
  }, [fetchHousing, city, search, capacityMin, availableFrom, availableTo, limit]);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    await fetchHousing({ city, search, capacityMin, availableFrom, availableTo, limit });
  }, [fetchHousing, city, search, capacityMin, availableFrom, availableTo, limit]);

  return { housing, status, error, refresh };
}
