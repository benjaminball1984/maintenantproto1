import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { getCampaign, type CampaignActionRow, type CampaignRow } from '@/lib/campaigns';

export type CampaignStatusUi = 'idle' | 'loading' | 'ready' | 'notfound' | 'error';

export interface UseCampaignResult {
  campaign: CampaignRow | null;
  actions: CampaignActionRow[];
  status: CampaignStatusUi;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

/**
 * Lit une campagne par slug avec ses actions. `refresh` rejoue la requête
 * (utile après ajout/retrait d'une action en mode édition).
 */
export function useCampaign(slug: string | undefined): UseCampaignResult {
  const [campaign, setCampaign] = useState<CampaignRow | null>(null);
  const [actions, setActions] = useState<CampaignActionRow[]>([]);
  const [status, setStatus] = useState<CampaignStatusUi>(slug ? 'loading' : 'idle');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [previousSlug, setPreviousSlug] = useState<string | undefined>(slug);
  if (previousSlug !== slug) {
    setPreviousSlug(slug);
    setCampaign(null);
    setActions([]);
    setError(null);
    setStatus(slug ? 'loading' : 'idle');
  }

  const fetchCampaign = useCallback(async (currentSlug: string) => {
    const { data, error: fetchError } = await getCampaign(currentSlug);
    if (fetchError) {
      setCampaign(null);
      setActions([]);
      setError(fetchError);
      setStatus('error');
      return;
    }
    if (!data) {
      setCampaign(null);
      setActions([]);
      setStatus('notfound');
      return;
    }
    setCampaign(data.campaign);
    setActions(data.actions);
    setStatus('ready');
  }, []);

  useEffect(() => {
    if (!slug) return;
    const currentSlug = slug;
    queueMicrotask(() => {
      void fetchCampaign(currentSlug);
    });
  }, [slug, fetchCampaign]);

  const refresh = useCallback(async () => {
    if (!slug) return;
    setStatus('loading');
    setError(null);
    await fetchCampaign(slug);
  }, [slug, fetchCampaign]);

  return { campaign, actions, status, error, refresh };
}
