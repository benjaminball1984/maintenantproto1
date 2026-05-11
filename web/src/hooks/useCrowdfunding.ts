import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import {
  listCrowdfunding,
  type CrowdfundingCampaignRow,
  type ListCrowdfundingParams,
} from '@/lib/crowdfunding';

export type CrowdfundingStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseCrowdfundingResult {
  campaigns: CrowdfundingCampaignRow[];
  status: CrowdfundingStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

export function useCrowdfunding(params: ListCrowdfundingParams = {}): UseCrowdfundingResult {
  const { search, limit } = params;
  const filterKey = JSON.stringify({ search, limit });

  const [campaigns, setCampaigns] = useState<CrowdfundingCampaignRow[]>([]);
  const [status, setStatus] = useState<CrowdfundingStatus>('loading');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [trackedKey, setTrackedKey] = useState<string>(filterKey);
  if (trackedKey !== filterKey) {
    setTrackedKey(filterKey);
    setCampaigns([]);
    setError(null);
    setStatus('loading');
  }

  const fetchCampaigns = useCallback(async (current: ListCrowdfundingParams) => {
    const { data, error: err } = await listCrowdfunding(current);
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
      void fetchCampaigns({ search, limit });
    });
  }, [fetchCampaigns, search, limit]);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    await fetchCampaigns({ search, limit });
  }, [fetchCampaigns, search, limit]);

  return { campaigns, status, error, refresh };
}
