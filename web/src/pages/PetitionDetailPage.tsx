import { useState, type CSSProperties } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';

import { IconArrowLeft, IconCheckCircle, IconFlame, IconUsers } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import { signPetition, unsignPetition } from '@/lib/petitions';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { usePetition } from '@/hooks/usePetition';

const pageStyle: CSSProperties = {
  maxWidth: 880,
  margin: '0 auto',
  padding: '24px 20px 80px',
};

const backLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 14,
  color: 'var(--mn-text-2)',
  textDecoration: 'none',
  fontWeight: 600,
  marginBottom: 20,
};

const headerStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 24,
  padding: '32px 28px',
  marginBottom: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const tagStyle: CSSProperties = {
  display: 'inline-block',
  alignSelf: 'flex-start',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--mn-brand-dark)',
  background: 'var(--mn-brand-light)',
  padding: '4px 10px',
  borderRadius: 999,
};

const titleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 'clamp(22px, 3.5vw, 32px)',
  fontWeight: 800,
  margin: 0,
  letterSpacing: '-0.02em',
  lineHeight: 1.2,
  color: 'var(--mn-text-1)',
};

const summaryStyle: CSSProperties = {
  fontSize: 16,
  lineHeight: 1.6,
  color: 'var(--mn-text-2)',
  margin: 0,
};

const statsRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 18,
  alignItems: 'center',
  fontSize: 14,
  color: 'var(--mn-text-2)',
};

const counterStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 32,
  fontWeight: 800,
  color: 'var(--mn-brand)',
  letterSpacing: '-0.02em',
};

const progressBarStyle: CSSProperties = {
  height: 8,
  borderRadius: 999,
  background: 'var(--mn-surface-2)',
  overflow: 'hidden',
};

const progressFillStyle: CSSProperties = {
  height: '100%',
  background: 'var(--mn-gradient)',
};

const ctaRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  alignItems: 'center',
};

const ctaButtonStyle: CSSProperties = {
  height: 48,
  border: 'none',
  borderRadius: 12,
  background: 'var(--mn-gradient)',
  color: '#ffffff',
  padding: '0 22px',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontFamily: 'inherit',
};

const ctaSignedStyle: CSSProperties = {
  ...ctaButtonStyle,
  background: 'var(--mn-success)',
};

const ctaDisabledStyle: CSSProperties = {
  ...ctaButtonStyle,
  background: 'var(--mn-surface-2)',
  color: 'var(--mn-text-3)',
  border: '1px solid var(--mn-border)',
  cursor: 'not-allowed',
};

const ctaSecondaryStyle: CSSProperties = {
  height: 48,
  borderRadius: 12,
  padding: '0 18px',
  border: '1.5px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  color: 'var(--mn-text-2)',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const bodyStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 24,
  padding: '28px',
  whiteSpace: 'pre-wrap',
  fontSize: 15,
  lineHeight: 1.65,
  color: 'var(--mn-text-1)',
};

const errorBoxStyle: CSSProperties = {
  background: '#fef2f2',
  borderRadius: 12,
  padding: '12px 16px',
  color: 'var(--mn-danger)',
  border: '1px solid #fecaca',
  margin: '14px 0',
};

const infoBoxStyle: CSSProperties = {
  background: 'var(--mn-surface-2)',
  borderRadius: 12,
  padding: '12px 16px',
  color: 'var(--mn-text-2)',
  border: '1px solid var(--mn-border)',
  margin: '14px 0',
  fontSize: 14,
  lineHeight: 1.5,
};

export default function PetitionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, status: authStatus } = useAuth();
  const location = useLocation();
  const { petition, status, error, signed, refresh } = usePetition(slug, user?.id ?? null);
  const [busy, setBusy] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (status === 'notfound') {
    return <Navigate to="/petitions" replace />;
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <main style={pageStyle}>
        <p role="status" aria-live="polite" style={{ color: 'var(--mn-text-3)' }}>
          Chargement de la pétition…
        </p>
      </main>
    );
  }

  if (status === 'error' || !petition) {
    return (
      <main style={pageStyle}>
        <div role="alert" style={errorBoxStyle}>
          {postgrestErrorMessage(error) ?? 'Pétition introuvable.'}
        </div>
        <Link to="/petitions" style={ctaSecondaryStyle}>
          <IconArrowLeft /> Retour aux pétitions
        </Link>
      </main>
    );
  }

  const ratio = Math.min(100, Math.round((petition.signature_count / petition.target_count) * 100));

  const handleSign = async () => {
    if (busy) return;
    setActionError(null);
    if (authStatus !== 'authenticated' || !user) {
      return;
    }
    setBusy(true);
    if (signed) {
      const { error: removeError } = await unsignPetition(petition.id, user.id);
      if (removeError) {
        setActionError(postgrestErrorMessage(removeError));
      } else {
        await refresh();
      }
    } else {
      const { error: signError } = await signPetition(petition.id, user.id);
      if (signError) {
        setActionError(postgrestErrorMessage(signError));
      } else {
        await refresh();
      }
    }
    setBusy(false);
  };

  const isAnonymous = authStatus === 'anonymous';
  const loginHref = `/?auth=login&next=${encodeURIComponent(location.pathname)}`;

  return (
    <main style={pageStyle}>
      <Link to="/petitions" style={backLinkStyle}>
        <IconArrowLeft /> Toutes les pétitions
      </Link>
      <header style={headerStyle}>
        <span style={tagStyle}>{petition.category}</span>
        <h1 style={titleStyle}>{petition.title}</h1>
        <p style={summaryStyle}>{petition.summary}</p>

        <div>
          <div style={statsRowStyle}>
            <div>
              <span style={counterStyle}>{petition.signature_count.toLocaleString('fr-FR')}</span>{' '}
              <span style={{ color: 'var(--mn-text-3)' }}>
                / {petition.target_count.toLocaleString('fr-FR')} signatures
              </span>
            </div>
            <div
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              aria-hidden="true"
            >
              <IconUsers />
              <span>{ratio}% de l&apos;objectif</span>
            </div>
          </div>
          <div style={{ ...progressBarStyle, marginTop: 10 }} aria-hidden="true">
            <div style={{ ...progressFillStyle, width: `${ratio}%` }} />
          </div>
        </div>

        {actionError && (
          <div role="alert" style={errorBoxStyle}>
            {actionError}
          </div>
        )}

        {isAnonymous && (
          <div role="note" style={infoBoxStyle}>
            Connectez-vous pour signer cette pétition. La création de compte est libre et gratuite.
          </div>
        )}

        <div style={ctaRowStyle}>
          {isAnonymous ? (
            <Link to={loginHref} style={ctaButtonStyle}>
              <IconFlame /> Se connecter pour signer
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleSign}
              disabled={busy || authStatus === 'loading'}
              aria-pressed={signed}
              aria-busy={busy || undefined}
              style={
                busy || authStatus === 'loading'
                  ? ctaDisabledStyle
                  : signed
                    ? ctaSignedStyle
                    : ctaButtonStyle
              }
            >
              {signed ? (
                <>
                  <IconCheckCircle />
                  {busy ? 'Retrait…' : 'Signée — retirer ma signature'}
                </>
              ) : (
                <>
                  <IconFlame />
                  {busy ? 'Signature en cours…' : 'Signer cette pétition'}
                </>
              )}
            </button>
          )}
        </div>
      </header>

      <section aria-labelledby="petition-body-title" style={bodyStyle}>
        <h2
          id="petition-body-title"
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 20,
            fontWeight: 700,
            margin: '0 0 14px',
          }}
        >
          La cause en détail
        </h2>
        {petition.body}
      </section>
    </main>
  );
}
