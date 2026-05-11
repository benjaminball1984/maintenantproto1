import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { getGarden, type GardenPlotRow } from '@/lib/garden';

export type GardenItemStatus = 'idle' | 'loading' | 'ready' | 'notfound' | 'error';

export interface UseGardenItemResult {
  garden: GardenPlotRow | null;
  status: GardenItemStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

export function useGardenItem(id: string | undefined): UseGardenItemResult {
  const [garden, setGarden] = useState<GardenPlotRow | null>(null);
  const [status, setStatus] = useState<GardenItemStatus>(id ? 'loading' : 'idle');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [previousId, setPreviousId] = useState<string | undefined>(id);
  if (previousId !== id) {
    setPreviousId(id);
    setGarden(null);
    setError(null);
    setStatus(id ? 'loading' : 'idle');
  }

  const fetchItem = useCallback(async (currentId: string) => {
    const { data, error: fetchError } = await getGarden(currentId);
    if (fetchError) {
      setGarden(null);
      setError(fetchError);
      setStatus('error');
      return;
    }
    if (!data) {
      setGarden(null);
      setStatus('notfound');
      return;
    }
    setGarden(data);
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

  return { garden, status, error, refresh };
}
