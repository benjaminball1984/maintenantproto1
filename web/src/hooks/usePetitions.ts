import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { listPetitions, type ListPetitionsParams, type PetitionRow } from '@/lib/petitions';

export type PetitionsStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UsePetitionsResult {
  petitions: PetitionRow[];
  status: PetitionsStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

/**
 * Charge la liste des pétitions publiques avec filtres optionnels. Les params
 * sont passés par valeur — le hook se ré-exécute si on change `search` ou
 * `category` (pattern « set state during render » pour reset les états locaux).
 */
export function usePetitions(params: ListPetitionsParams = {}): UsePetitionsResult {
  const { status: filterStatus, search, category, limit } = params;
  const filterKey = JSON.stringify({ filterStatus, search, category, limit });

  const [petitions, setPetitions] = useState<PetitionRow[]>([]);
  const [status, setStatus] = useState<PetitionsStatus>('loading');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [trackedKey, setTrackedKey] = useState<string>(filterKey);
  if (trackedKey !== filterKey) {
    setTrackedKey(filterKey);
    setPetitions([]);
    setError(null);
    setStatus('loading');
  }

  const fetchPetitions = useCallback(async (current: ListPetitionsParams) => {
    const { data, error: err } = await listPetitions(current);
    if (err) {
      setPetitions([]);
      setError(err);
      setStatus('error');
      return;
    }
    setPetitions(data);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchPetitions({ status: filterStatus, search, category, limit });
    });
  }, [fetchPetitions, filterStatus, search, category, limit]);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    await fetchPetitions({ status: filterStatus, search, category, limit });
  }, [fetchPetitions, filterStatus, search, category, limit]);

  return { petitions, status, error, refresh };
}
