import { useEffect, useState, type CSSProperties } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';

import Breadcrumbs from '@/components/Breadcrumbs';
import {
  IconArrowLeft,
  IconBarChart,
  IconCheck,
  IconCheckCircle,
  IconShare,
} from '@/components/icons';
import { useAuth } from '@/lib/auth';
import { unvotePoll, votePoll, type PollOptionRow } from '@/lib/polls';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { usePoll } from '@/hooks/usePoll';

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

const descriptionStyle: CSSProperties = {
  fontSize: 16,
  lineHeight: 1.6,
  color: 'var(--mn-text-2)',
  margin: 0,
};

const optionsListStyle: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};

const optionRowBaseStyle: CSSProperties = {
  width: '100%',
  background: 'var(--mn-surface)',
  border: '1.5px solid var(--mn-border)',
  borderRadius: 14,
  padding: '14px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: 'inherit',
  color: 'var(--mn-text-1)',
  position: 'relative',
};

const optionRowSelectedStyle: CSSProperties = {
  ...optionRowBaseStyle,
  borderColor: 'var(--mn-brand)',
  background: 'var(--mn-brand-light)',
};

const optionRowDisabledStyle: CSSProperties = {
  ...optionRowBaseStyle,
  cursor: 'default',
};

const optionTopStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  fontSize: 15,
  fontWeight: 600,
};

const optionPctStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontWeight: 800,
  color: 'var(--mn-brand)',
  fontSize: 14,
};

const progressBarStyle: CSSProperties = {
  height: 6,
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
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  textDecoration: 'none',
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

function ratio(count: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((count / total) * 100));
}

export default function PollDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, status: authStatus } = useAuth();
  const location = useLocation();
  const { poll, options, status, error, userOptionId, refresh } = usePoll(slug, user?.id ?? null);
  const [pendingOption, setPendingOption] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [shared, setShared] = useState<boolean>(false);
  const [isClosed, setIsClosed] = useState<boolean>(false);

  useEffect(() => {
    const closesAt = poll?.closes_at;
    queueMicrotask(() => {
      if (!closesAt) {
        setIsClosed(false);
        return;
      }
      const ts = Date.parse(closesAt);
      setIsClosed(!Number.isNaN(ts) && ts <= Date.now());
    });
  }, [poll?.closes_at]);

  if (status === 'notfound') {
    return <Navigate to="/polls" replace />;
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <main style={pageStyle}>
        <p role="status" aria-live="polite" style={{ color: 'var(--mn-text-3)' }}>
          Chargement du sondage…
        </p>
      </main>
    );
  }

  if (status === 'error' || !poll) {
    return (
      <main style={pageStyle}>
        <div role="alert" style={errorBoxStyle}>
          {postgrestErrorMessage(error) ?? 'Sondage introuvable.'}
        </div>
        <Link to="/polls" style={ctaSecondaryStyle}>
          <IconArrowLeft /> Retour aux sondages
        </Link>
      </main>
    );
  }

  const totalVotes = options.reduce((acc, opt) => acc + opt.vote_count, 0);
  const isAnonymous = authStatus === 'anonymous';
  const loginHref = `/?auth=login&next=${encodeURIComponent(location.pathname)}`;

  const handleVote = async () => {
    if (busy) return;
    setActionError(null);
    if (authStatus !== 'authenticated' || !user) return;
    if (userOptionId) {
      setBusy(true);
      const { error: removeError } = await unvotePoll(poll.id, user.id);
      if (removeError) {
        setActionError(postgrestErrorMessage(removeError));
      } else {
        await refresh();
      }
      setBusy(false);
      return;
    }
    if (!pendingOption) {
      setActionError('Sélectionnez une option avant de valider votre vote.');
      return;
    }
    setBusy(true);
    const { error: voteError } = await votePoll(poll.id, pendingOption, user.id);
    if (voteError) {
      setActionError(postgrestErrorMessage(voteError));
    } else {
      setPendingOption(null);
      await refresh();
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
        await navigatorWithShare.share({ title: poll.question, url });
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

  const renderOption = (option: PollOptionRow) => {
    const isUserChoice = userOptionId === option.id;
    const isPending = pendingOption === option.id;
    const showResults = Boolean(userOptionId) || isClosed;
    const pct = showResults ? ratio(option.vote_count, totalVotes) : 0;
    const rowStyle = isUserChoice
      ? optionRowSelectedStyle
      : isPending
        ? optionRowSelectedStyle
        : isAnonymous || isClosed || busy || userOptionId
          ? optionRowDisabledStyle
          : optionRowBaseStyle;
    const disabled = isAnonymous || isClosed || busy || Boolean(userOptionId);

    return (
      <li key={option.id}>
        <button
          type="button"
          onClick={() => {
            if (disabled) return;
            setPendingOption(option.id);
            setActionError(null);
          }}
          disabled={disabled}
          aria-pressed={isUserChoice || isPending}
          style={rowStyle}
        >
          <span style={optionTopStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              {isUserChoice && <IconCheck width={14} height={14} />}
              {option.label}
            </span>
            {showResults && (
              <span style={optionPctStyle}>
                {pct}%
                <span
                  style={{
                    color: 'var(--mn-text-3)',
                    fontWeight: 600,
                    fontSize: 12,
                    marginLeft: 6,
                  }}
                >
                  ({option.vote_count.toLocaleString('fr-FR')})
                </span>
              </span>
            )}
          </span>
          {showResults && (
            <span style={progressBarStyle} aria-hidden="true">
              <span style={{ ...progressFillStyle, width: `${pct}%`, display: 'block' }} />
            </span>
          )}
        </button>
      </li>
    );
  };

  return (
    <main style={pageStyle}>
      <Breadcrumbs
        items={[
          { label: 'Accueil', to: '/' },
          { label: 'Sondages', to: '/polls' },
          { label: poll.question },
        ]}
      />
      <Link to="/polls" style={backLinkStyle}>
        <IconArrowLeft /> Tous les sondages
      </Link>
      <header style={headerStyle}>
        <span style={tagStyle}>
          <IconBarChart width={14} height={14} />
          {isClosed ? 'Sondage clôturé' : 'Sondage ouvert'}
        </span>
        <h1 style={titleStyle}>{poll.question}</h1>
        {poll.description && <p style={descriptionStyle}>{poll.description}</p>}

        <ul aria-label="Options du sondage" style={optionsListStyle}>
          {options.map(renderOption)}
        </ul>

        {actionError && (
          <div role="alert" style={errorBoxStyle}>
            {actionError}
          </div>
        )}

        {isAnonymous && (
          <div role="note" style={infoBoxStyle}>
            Connectez-vous pour voter à ce sondage. Un compte adhérent garantit un vote unique et
            anonyme.
          </div>
        )}

        <div style={ctaRowStyle}>
          {isAnonymous ? (
            <Link to={loginHref} style={ctaButtonStyle}>
              <IconBarChart /> Se connecter pour voter
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleVote}
              disabled={busy || authStatus === 'loading' || (isClosed && !userOptionId)}
              aria-busy={busy || undefined}
              aria-pressed={Boolean(userOptionId)}
              style={
                busy || authStatus === 'loading' || (isClosed && !userOptionId)
                  ? ctaDisabledStyle
                  : userOptionId
                    ? ctaSignedStyle
                    : ctaButtonStyle
              }
            >
              {userOptionId ? (
                <>
                  <IconCheckCircle />
                  {busy ? 'Retrait…' : 'Vote enregistré — retirer mon vote'}
                </>
              ) : (
                <>
                  <IconBarChart />
                  {busy ? 'Vote en cours…' : isClosed ? 'Sondage clôturé' : 'Valider mon vote'}
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

        <div style={{ fontSize: 13, color: 'var(--mn-text-3)' }}>
          {totalVotes.toLocaleString('fr-FR')} vote{totalVotes > 1 ? 's' : ''} au total
          {poll.members_only ? ' · Réservé aux adhérent·es' : ' · Vote citoyen libre'}
        </div>
      </header>
    </main>
  );
}
