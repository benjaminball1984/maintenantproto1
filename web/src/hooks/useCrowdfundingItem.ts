import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { getCrowdfunding, type CrowdfundingCampaignRow } from '@/lib/crowdfunding';

export type CrowdfundingItemStatus = 'idle' | 'loading' | 'ready' | 'notfound' | 'error';

export interface UseCrowdfundingItemResult {
  campaign: CrowdfundingCampaignRow | null;
  status: CrowdfundingItemStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

export function useCrowdfundingItem(id: string | undefined): UseCrowdfundingItemResult {
  const [campaign, setCampaign] = useState<CrowdfundingCampaignRow | null>(null);
  const [status, setStatus] = useState<CrowdfundingItemStatus>(id ? 'loading' : 'idle');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [previousId, setPreviousId] = useState<string | undefined>(id);
  if (previousId !== id) {
    setPreviousId(id);
    setCampaign(null);
    setError(null);
    setStatus(id ? 'loading' : 'idle');
  }

  const fetchItem = useCallback(async (currentId: string) => {
    const { data, error: fetchError } = await getCrowdfunding(currentId);
    if (fetchError) {
      setCampaign(null);
      setError(fetchError);
      setStatus('error');
      return;
    }
    if (!data) {
      setCampaign(null);
      setStatus('notfound');
      return;
    }
    setCampaign(data);
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

  return { campaign, status, error, refresh };
}
