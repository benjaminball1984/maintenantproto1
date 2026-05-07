import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Lance un avertissement dev — en prod on doit avoir les vars d'env Netlify configurées
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquant. La signature ne sera pas persistée.',
  );
}

export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: { persistSession: false },
});

export type SignaturePayload = {
  first_name: string;
  last_name: string;
  email: string;
  postal_code: string;
  phone?: string | null;
  consent_campaign: boolean;
  consent_newsletter: boolean;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
};
