import { useEffect, useState, type CSSProperties } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';

import {
  IconArrowLeft,
  IconCalendar,
  IconCheckCircle,
  IconPin,
  IconShare,
  IconUsers,
} from '@/components/icons';
import { useAuth } from '@/lib/auth';
import { formatMobilizationDate, formatMobilizationTime } from '@/lib/mobilizationFormat';
import { cancelRsvp, rsvpMobilization } from '@/lib/mobilizations';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { useMobilization } from '@/hooks/useMobilization';

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
  display: 'inline-flex',
  alignSelf: 'flex-start',
  alignItems: 'center',
  gap: 6,
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

const metaRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 18,
  alignItems: 'center',
  fontSize: 14,
  color: 'var(--mn-text-2)',
};

const metaItemStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
};

const counterStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 32,
  fontWeight: 800,
  color: 'var(--mn-brand)',
  letterSpacing: '-0.02em',
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
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  textDecoration: 'none',
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

const shareConfirmStyle: CSSProperties = {
  background: 'var(--mn-surface-2)',
  borderRadius: 12,
  padding: '8px 14px',
  color: 'var(--mn-text-2)',
  border: '1px solid var(--mn-border)',
  fontSize: 13,
};

export default function MobilizationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, status: authStatus } = useAuth();
  const location = useLocation();
  const { mobilization, status, error, rsvp, refresh } = useMobilization(slug, user?.id ?? null);
  const [busy, setBusy] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [shared, setShared] = useState<boolean>(false);
  const [isPast, setIsPast] = useState<boolean>(false);

  useEffect(() => {
    const startsAt = mobilization?.starts_at;
    queueMicrotask(() => {
      if (!startsAt) {
        setIsPast(false);
        return;
      }
      const startsAtTs = Date.parse(startsAt);
      setIsPast(!Number.isNaN(startsAtTs) && startsAtTs < Date.now());
    });
  }, [mobilization?.starts_at]);

  if (status === 'notfound') {
    return <Navigate to="/mobilizations" replace />;
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <main style={pageStyle}>
        <p role="status" aria-live="polite" style={{ color: 'var(--mn-text-3)' }}>
          Chargement de la mobilisation…
        </p>
      </main>
    );
  }

  if (status === 'error' || !mobilization) {
    return (
      <main style={pageStyle}>
        <div role="alert" style={errorBoxStyle}>
          {postgrestErrorMessage(error) ?? 'Mobilisation introuvable.'}
        </div>
        <Link to="/mobilizations" style={ctaSecondaryStyle}>
          <IconArrowLeft /> Retour aux mobilisations
        </Link>
      </main>
    );
  }

  const handleRsvp = async () => {
    if (busy) return;
    setActionError(null);
    if (authStatus !== 'authenticated' || !user) return;
    setBusy(true);
    if (rsvp) {
      const { error: removeError } = await cancelRsvp(mobilization.id, user.id);
      if (removeError) {
        setActionError(postgrestErrorMessage(removeError));
      } else {
        await refresh();
      }
    } else {
      const { error: rsvpError } = await rsvpMobilization(mobilization.id, user.id);
      if (rsvpError) {
        setActionError(postgrestErrorMessage(rsvpError));
      } else {
        await refresh();
      }
    }
    setBusy(false);
  };

  const handleShare = async () => {
    setShared(false);
    const url =
      typeof window !== 'undefined' ? `${window.location.origin}${location.pathname}` : '';
    const navigatorWithShare = typeof navigator !== 'undefined' ? navigator : undefined;
    if (navigatorWithShare && 'share' in navigatorWithShare) {
      try {
        await navigatorWithShare.share({ title: mobilization.title, url });
        setShared(true);
        return;
      } catch {
        // fall back to clipboard
      }
    }
    if (navigatorWithShare?.clipboard?.writeText && url) {
      try {
        await navigatorWithShare.clipboard.writeText(url);
        setShared(true);
      } catch {
        // ignore — l'utilisateur peut copier l'URL manuellement
      }
    }
  };

  const isAnonymous = authStatus === 'anonymous';
  const loginHref = `/?auth=login&next=${encodeURIComponent(location.pathname)}`;
  const longDate = formatMobilizationDate(mobilization.starts_at, 'long');
  const startTime = formatMobilizationTime(mobilization.starts_at);
  const endTime = formatMobilizationTime(mobilization.ends_at);

  return (
    <main style={pageStyle}>
      <Link to="/mobilizations" style={backLinkStyle}>
        <IconArrowLeft /> Toutes les mobilisations
      </Link>
      <header style={headerStyle}>
        <span style={tagStyle}>
          <IconCalendar width={14} height={14} />
          {longDate || 'Date à confirmer'}
        </span>
        <h1 style={titleStyle}>{mobilization.title}</h1>
        <p style={summaryStyle}>{mobilization.summary}</p>

        <div style={metaRowStyle}>
          <span style={metaItemStyle}>
            <IconPin />
            {mobilization.city}
            {mobilization.address ? ` — ${mobilization.address}` : ''}
          </span>
          {startTime && (
            <span style={metaItemStyle}>
              <IconCalendar />
              {startTime}
              {endTime ? ` → ${endTime}` : ''}
            </span>
          )}
          <span style={metaItemStyle}>
            <IconUsers />
            <span style={counterStyle}>
              {mobilization.participation_count.toLocaleString('fr-FR')}
            </span>
            <span style={{ color: 'var(--mn-text-3)' }}>
              inscrit{mobilization.participation_count > 1 ? 's' : ''}
            </span>
          </span>
        </div>

        {actionError && (
          <div role="alert" style={errorBoxStyle}>
            {actionError}
          </div>
        )}

        {isAnonymous && (
          <div role="note" style={infoBoxStyle}>
            Connectez-vous pour vous inscrire à cette mobilisation.
          </div>
        )}

        <div style={ctaRowStyle}>
          {isAnonymous ? (
            <Link to={loginHref} style={ctaButtonStyle}>
              <IconUsers /> Se connecter pour participer
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleRsvp}
              disabled={busy || authStatus === 'loading' || (isPast && !rsvp)}
              aria-pressed={rsvp}
              aria-busy={busy || undefined}
              style={
                busy || authStatus === 'loading' || (isPast && !rsvp)
                  ? ctaDisabledStyle
                  : rsvp
                    ? ctaSignedStyle
                    : ctaButtonStyle
              }
            >
              {rsvp ? (
                <>
                  <IconCheckCircle />
                  {busy ? 'Désinscription…' : 'Inscrit·e — me désinscrire'}
                </>
              ) : (
                <>
                  <IconUsers />
                  {busy ? 'Inscription…' : isPast ? 'Mobilisation passée' : 'Je participe'}
                </>
              )}
            </button>
          )}
          <button type="button" onClick={handleShare} style={ctaSecondaryStyle}>
            <IconShare /> Partager
          </button>
          {shared && (
            <span role="status" style={shareConfirmStyle}>
              Lien copié.
            </span>
          )}
        </div>
      </header>

      {mobilization.body && (
        <section aria-labelledby="mobilization-body-title" style={bodyStyle}>
          <h2
            id="mobilization-body-title"
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 20,
              fontWeight: 700,
              margin: '0 0 14px',
            }}
          >
            En détail
          </h2>
          {mobilization.body}
        </section>
      )}
    </main>
  );
}
