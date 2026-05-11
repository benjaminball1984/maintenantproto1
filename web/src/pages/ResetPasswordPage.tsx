import { useEffect, useId, useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { IconCheck, IconLock } from '@/components/icons';
import { authErrorMessage } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const containerStyle: CSSProperties = {
  maxWidth: 460,
  margin: '0 auto',
  padding: '48px 20px',
};

const cardStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 20,
  padding: 28,
};

const titleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 22,
  fontWeight: 800,
  color: 'var(--mn-text-1)',
  margin: '0 0 6px',
  letterSpacing: '-0.02em',
};

const subtitleStyle: CSSProperties = {
  fontSize: 14,
  color: 'var(--mn-text-3)',
  margin: '0 0 24px',
  lineHeight: 1.5,
};

const fieldStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  marginBottom: 14,
};

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--mn-text-3)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const inputWrapperStyle: CSSProperties = {
  position: 'relative',
};

const inputStyle: CSSProperties = {
  width: '100%',
  minHeight: 46,
  border: '1.5px solid var(--mn-border)',
  borderRadius: 12,
  padding: '0 16px 0 44px',
  fontSize: 15,
  fontFamily: 'Inter, sans-serif',
  color: 'var(--mn-text-1)',
  background: 'var(--mn-bg)',
  outline: 'none',
  boxSizing: 'border-box',
};

const iconStyle: CSSProperties = {
  position: 'absolute',
  left: 14,
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--mn-text-4)',
  display: 'flex',
  pointerEvents: 'none',
};

const submitBtnStyle: CSSProperties = {
  width: '100%',
  minHeight: 48,
  border: 'none',
  borderRadius: 12,
  background: 'var(--mn-gradient)',
  color: '#ffffff',
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
  marginTop: 8,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
};

const messageBaseStyle: CSSProperties = {
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 13,
  lineHeight: 1.5,
  marginBottom: 12,
};

const errorBoxStyle: CSSProperties = {
  ...messageBaseStyle,
  background: '#FEF2F2',
  color: 'var(--mn-danger)',
  border: '1px solid #FECACA',
};

const successBoxStyle: CSSProperties = {
  ...messageBaseStyle,
  background: '#F0FDF4',
  color: 'var(--mn-success)',
  border: '1px solid #BBF7D0',
};

type ExchangeStatus = 'idle' | 'exchanging' | 'ready' | 'expired';

/**
 * Récupère le code depuis l'URL : la primitive Supabase passe `?code=…` ou
 * pose un fragment `#access_token=…` selon les versions. On gère les deux.
 */
function extractCodeFromLocation(searchCode: string | null): string | null {
  if (searchCode) return searchCode;
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  return params.get('code') ?? params.get('access_token');
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = useMemo(() => extractCodeFromLocation(searchParams.get('code')), [searchParams]);
  const [status, setStatus] = useState<ExchangeStatus>(code ? 'exchanging' : 'expired');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    code ? null : 'Lien invalide ou expiré. Demandez un nouveau lien depuis la page de connexion.',
  );
  const [success, setSuccess] = useState<string | null>(null);
  const errorId = useId();

  useEffect(() => {
    if (!code) return;
    void supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
      if (exchangeError) {
        setStatus('expired');
        setError(
          authErrorMessage(exchangeError) ??
            'Lien expiré. Demandez un nouveau lien de réinitialisation.',
        );
        return;
      }
      setStatus('ready');
    });
  }, [code]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccess(null);
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (updateError) {
      setError(authErrorMessage(updateError));
      return;
    }
    setSuccess('Mot de passe mis à jour. Redirection vers votre profil…');
    window.setTimeout(() => navigate('/profile', { replace: true }), 800);
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Nouveau mot de passe</h1>
        <p style={subtitleStyle}>
          Choisissez un mot de passe d’au moins 8 caractères pour sécuriser votre compte.
        </p>

        {error ? (
          <div id={errorId} role="alert" style={errorBoxStyle}>
            {error}
          </div>
        ) : null}
        {success ? (
          <div role="status" style={successBoxStyle}>
            {success}
          </div>
        ) : null}

        {status === 'exchanging' ? (
          <p role="status" style={{ color: 'var(--mn-text-3)' }}>
            Vérification du lien…
          </p>
        ) : null}

        {status === 'ready' ? (
          <form onSubmit={handleSubmit} noValidate>
            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="reset-password">
                Nouveau mot de passe
              </label>
              <div style={inputWrapperStyle}>
                <span style={iconStyle}>
                  <IconLock />
                </span>
                <input
                  id="reset-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  style={inputStyle}
                  aria-describedby={error ? errorId : undefined}
                />
              </div>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="reset-password-confirm">
                Confirmer le mot de passe
              </label>
              <div style={inputWrapperStyle}>
                <span style={iconStyle}>
                  <IconLock />
                </span>
                <input
                  id="reset-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  minLength={8}
                  required
                  style={inputStyle}
                  aria-describedby={error ? errorId : undefined}
                />
              </div>
            </div>
            <button type="submit" style={submitBtnStyle} disabled={submitting}>
              <IconCheck />
              {submitting ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
