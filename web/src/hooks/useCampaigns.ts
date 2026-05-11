import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { listCampaigns, type CampaignRow, type ListCampaignsParams } from '@/lib/campaigns';

export type CampaignsStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseCampaignsResult {
  campaigns: CampaignRow[];
  status: CampaignsStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

/**
 * Charge la liste des campagnes publiques avec filtres optionnels. Le hook
 * se ré-exécute si `search` ou `status` changent (reset des états locaux
 * pendant le render).
 */
export function useCampaigns(params: ListCampaignsParams = {}): UseCampaignsResult {
  const { status: filterStatus, search, limit } = params;
  const filterKey = JSON.stringify({ filterStatus, search, limit });

  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [status, setStatus] = useState<CampaignsStatus>('loading');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [trackedKey, setTrackedKey] = useState<string>(filterKey);
  if (trackedKey !== filterKey) {
    setTrackedKey(filterKey);
    setCampaigns([]);
    setError(null);
    setStatus('loading');
  }

  const fetchCampaigns = useCallback(async (current: ListCampaignsParams) => {
    const { data, error: err } = await listCampaigns(current);
    if (err) {
      setCampaigns([]);
      setError(err);
      setStatus('error');
      return;
    }
    setCampaigns(data);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchCampaigns({ status: filterStatus, search, limit });
    });
  }, [fetchCampaigns, filterStatus, search, limit]);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    await fetchCampaigns({ status: filterStatus, search, limit });
  }, [fetchCampaigns, filterStatus, search, limit]);

  return { campaigns, status, error, refresh };
}
