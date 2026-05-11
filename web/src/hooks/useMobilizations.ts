import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import {
  listMobilizations,
  type ListMobilizationsParams,
  type MobilizationRow,
} from '@/lib/mobilizations';

export type MobilizationsStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseMobilizationsResult {
  mobilizations: MobilizationRow[];
  status: MobilizationsStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

/**
 * Charge la liste des mobilisations publiques avec filtres optionnels. Les
 * params sont passés par valeur — le hook se ré-exécute si on change `search`,
 * `city` ou la fenêtre temporelle (pattern « set state during render » pour
 * reset les états locaux quand le `filterKey` change).
 */
export function useMobilizations(params: ListMobilizationsParams = {}): UseMobilizationsResult {
  const { status: filterStatus, search, city, startsAfter, startsBefore, limit } = params;
  const filterKey = JSON.stringify({
    filterStatus,
    search,
    city,
    startsAfter,
    startsBefore,
    limit,
  });

  const [mobilizations, setMobilizations] = useState<MobilizationRow[]>([]);
  const [status, setStatus] = useState<MobilizationsStatus>('loading');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [trackedKey, setTrackedKey] = useState<string>(filterKey);
  if (trackedKey !== filterKey) {
    setTrackedKey(filterKey);
    setMobilizations([]);
    setError(null);
    setStatus('loading');
  }

  const fetchMobilizations = useCallback(async (current: ListMobilizationsParams) => {
    const { data, error: err } = await listMobilizations(current);
    if (err) {
      setMobilizations([]);
      setError(err);
      setStatus('error');
      return;
    }
    setMobilizations(data);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchMobilizations({
        status: filterStatus,
        search,
        city,
        startsAfter,
        startsBefore,
        limit,
      });
    });
  }, [fetchMobilizations, filterStatus, search, city, startsAfter, startsBefore, limit]);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    await fetchMobilizations({
      status: filterStatus,
      search,
      city,
      startsAfter,
      startsBefore,
      limit,
    });
  }, [fetchMobilizations, filterStatus, search, city, startsAfter, startsBefore, limit]);

  return { mobilizations, status, error, refresh };
}
