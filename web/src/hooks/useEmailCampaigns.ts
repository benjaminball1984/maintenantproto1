import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { listEmailCampaigns, type EmailCampaignRow } from '@/lib/admin';

export type EmailCampaignsStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseEmailCampaignsResult {
  campaigns: EmailCampaignRow[];
  status: EmailCampaignsStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

/**
 * Liste les campagnes email. `enabled` permet de différer la requête tant
 * qu'on n'est pas certain que l'utilisateur est admin — la RLS filtrerait de
 * toute façon, mais éviter le round-trip est plus propre côté UX.
 */
export function useEmailCampaigns(enabled: boolean): UseEmailCampaignsResult {
  const [campaigns, setCampaigns] = useState<EmailCampaignRow[]>([]);
  const [status, setStatus] = useState<EmailCampaignsStatus>(enabled ? 'loading' : 'idle');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [previousEnabled, setPreviousEnabled] = useState<boolean>(enabled);
  if (previousEnabled !== enabled) {
    setPreviousEnabled(enabled);
    setCampaigns([]);
    setError(null);
    setStatus(enabled ? 'loading' : 'idle');
  }

  const fetchCampaigns = useCallback(async () => {
    const { data, error: err } = await listEmailCampaigns();
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
    if (!enabled) return;
    queueMicrotask(() => {
      void fetchCampaigns();
    });
  }, [enabled, fetchCampaigns]);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setStatus('loading');
    setError(null);
    await fetchCampaigns();
  }, [enabled, fetchCampaigns]);

  return { campaigns, status, error, refresh };
}
