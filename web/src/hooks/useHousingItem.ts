import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { getHousing, type HousingRow } from '@/lib/housing';

export type HousingItemStatus = 'idle' | 'loading' | 'ready' | 'notfound' | 'error';

export interface UseHousingItemResult {
  housing: HousingRow | null;
  status: HousingItemStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

/**
 * Lit un hébergement par ID. `refresh` rejoue la requête (utile après
 * acceptation/refus d'une demande, qui peut changer la disponibilité).
 */
export function useHousingItem(id: string | undefined): UseHousingItemResult {
  const [housing, setHousing] = useState<HousingRow | null>(null);
  const [status, setStatus] = useState<HousingItemStatus>(id ? 'loading' : 'idle');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [previousId, setPreviousId] = useState<string | undefined>(id);
  if (previousId !== id) {
    setPreviousId(id);
    setHousing(null);
    setError(null);
    setStatus(id ? 'loading' : 'idle');
  }

  const fetchItem = useCallback(async (currentId: string) => {
    const { data, error: fetchError } = await getHousing(currentId);
    if (fetchError) {
      setHousing(null);
      setError(fetchError);
      setStatus('error');
      return;
    }
    if (!data) {
      setHousing(null);
      setStatus('notfound');
      return;
    }
    setHousing(data);
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

  return { housing, status, error, refresh };
}
