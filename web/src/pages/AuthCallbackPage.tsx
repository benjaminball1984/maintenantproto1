import { useEffect, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

import { authErrorMessage } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const containerStyle: CSSProperties = {
  maxWidth: 460,
  margin: '0 auto',
  padding: '64px 20px',
  textAlign: 'center',
};

const titleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 22,
  fontWeight: 800,
  color: 'var(--mn-text-1)',
  margin: '0 0 12px',
  letterSpacing: '-0.02em',
};

const bodyStyle: CSSProperties = {
  fontSize: 14,
  color: 'var(--mn-text-3)',
  lineHeight: 1.5,
  margin: 0,
};

const errorBoxStyle: CSSProperties = {
  borderRadius: 12,
  padding: '14px 16px',
  fontSize: 13,
  lineHeight: 1.5,
  background: '#FEF2F2',
  color: 'var(--mn-danger)',
  border: '1px solid #FECACA',
  marginTop: 16,
};

type Status = 'exchanging' | 'success' | 'error';

/**
 * Récupère un code OAuth depuis `?code=…` (PKCE flow) ou un fragment
 * `#access_token=…` (implicit flow). Si rien n'est présent, on considère
 * que l'URL est invalide.
 */
function hasCallbackPayload(href: string): boolean {
  try {
    const url = new URL(href);
    if (url.searchParams.has('code') || url.searchParams.has('error')) return true;
    const hash = url.hash.replace(/^#/, '');
    if (!hash) return false;
    const hashParams = new URLSearchParams(hash);
    return (
      hashParams.has('access_token') ||
      hashParams.has('code') ||
      hashParams.has('error') ||
      hashParams.has('error_description')
    );
  } catch {
    return false;
  }
}

const noPayloadError = 'Lien d’authentification invalide ou expiré. Recommencez la connexion.';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const initialHref = typeof window === 'undefined' ? '' : window.location.href;
  const initialHasPayload = hasCallbackPayload(initialHref);
  const [status, setStatus] = useState<Status>(initialHasPayload ? 'exchanging' : 'error');
  const [errorText, setErrorText] = useState<string | null>(
    initialHasPayload ? null : noPayloadError,
  );

  useEffect(() => {
    if (!initialHasPayload) return;
    let cancelled = false;
    void supabase.auth.exchangeCodeForSession(initialHref).then(({ error }) => {
      if (cancelled) return;
      if (error) {
        setStatus('error');
        setErrorText(authErrorMessage(error));
        return;
      }
      setStatus('success');
      navigate('/profile', { replace: true });
    });

    return () => {
      cancelled = true;
    };
  }, [navigate, initialHasPayload, initialHref]);

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Connexion en cours…</h1>
      {status === 'exchanging' && (
        <p role="status" style={bodyStyle}>
          Validation du lien d’authentification. Cette opération prend quelques secondes.
        </p>
      )}
      {status === 'success' && (
        <p role="status" style={bodyStyle}>
          Connexion réussie. Redirection vers votre profil…
        </p>
      )}
      {status === 'error' && (
        <div role="alert" style={errorBoxStyle}>
          {errorText ?? 'Une erreur est survenue lors de la connexion. Réessayez.'}
        </div>
      )}
    </div>
  );
}
