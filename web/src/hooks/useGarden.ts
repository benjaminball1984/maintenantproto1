import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { listGarden, type GardenPlotRow, type ListGardenParams } from '@/lib/garden';

export type GardenStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseGardenResult {
  gardens: GardenPlotRow[];
  status: GardenStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

export function useGarden(params: ListGardenParams = {}): UseGardenResult {
  const { city, search, withSpots, limit } = params;
  const filterKey = JSON.stringify({ city, search, withSpots, limit });

  const [gardens, setGardens] = useState<GardenPlotRow[]>([]);
  const [status, setStatus] = useState<GardenStatus>('loading');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [trackedKey, setTrackedKey] = useState<string>(filterKey);
  if (trackedKey !== filterKey) {
    setTrackedKey(filterKey);
    setGardens([]);
    setError(null);
    setStatus('loading');
  }

  const fetchGardens = useCallback(async (current: ListGardenParams) => {
    const { data, error: err } = await listGarden(current);
    if (err) {
      setGardens([]);
      setError(err);
      setStatus('error');
      return;
    }
    setGardens(data);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchGardens({ city, search, withSpots, limit });
    });
  }, [fetchGardens, city, search, withSpots, limit]);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    await fetchGardens({ city, search, withSpots, limit });
  }, [fetchGardens, city, search, withSpots, limit]);

  return { gardens, status, error, refresh };
}
