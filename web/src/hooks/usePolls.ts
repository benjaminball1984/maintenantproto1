import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { listPolls, type ListPollsParams, type PollRow } from '@/lib/polls';

export type PollsStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UsePollsResult {
  polls: PollRow[];
  status: PollsStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

/**
 * Charge la liste des sondages publics avec filtres optionnels. Les params
 * sont passés par valeur — le hook se ré-exécute si on change `search` ou
 * `status` (reset des états locaux pendant le render).
 */
export function usePolls(params: ListPollsParams = {}): UsePollsResult {
  const { status: filterStatus, search, limit } = params;
  const filterKey = JSON.stringify({ filterStatus, search, limit });

  const [polls, setPolls] = useState<PollRow[]>([]);
  const [status, setStatus] = useState<PollsStatus>('loading');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [trackedKey, setTrackedKey] = useState<string>(filterKey);
  if (trackedKey !== filterKey) {
    setTrackedKey(filterKey);
    setPolls([]);
    setError(null);
    setStatus('loading');
  }

  const fetchPolls = useCallback(async (current: ListPollsParams) => {
    const { data, error: err } = await listPolls(current);
    if (err) {
      setPolls([]);
      setError(err);
      setStatus('error');
      return;
    }
    setPolls(data);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchPolls({ status: filterStatus, search, limit });
    });
  }, [fetchPolls, filterStatus, search, limit]);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    await fetchPolls({ status: filterStatus, search, limit });
  }, [fetchPolls, filterStatus, search, limit]);

  return { polls, status, error, refresh };
}
