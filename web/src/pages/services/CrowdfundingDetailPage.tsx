import { useState, type CSSProperties } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';

import {
  IconArrowLeft,
  IconCart,
  IconCheckCircle,
  IconFlame,
  IconShare,
} from '@/components/icons';
import { useAuth } from '@/lib/auth';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { useCrowdfundingItem } from '@/hooks/useCrowdfundingItem';

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

const heroStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 24,
  padding: '32px 28px',
  marginBottom: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
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
  fontSize: 17,
  lineHeight: 1.55,
  color: 'var(--mn-text-2)',
  margin: 0,
};

const bodyStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.7,
  color: 'var(--mn-text-1)',
  margin: 0,
  whiteSpace: 'pre-wrap',
};

const progressBarStyle: CSSProperties = {
  height: 12,
  borderRadius: 8,
  background: 'var(--mn-surface-2)',
  overflow: 'hidden',
};

const progressFillStyle = (ratio: number): CSSProperties => ({
  width: `${Math.min(ratio * 100, 100)}%`,
  height: '100%',
  background: 'var(--mn-gradient)',
});

const progressLabelRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  alignItems: 'baseline',
  justifyContent: 'space-between',
};

const raisedStyle: CSSProperties = {
  fontSize: 22,
  fontFamily: "'Sora', sans-serif",
  fontWeight: 800,
  color: 'var(--mn-text-1)',
};

const goalStyle: CSSProperties = {
  fontSize: 13,
  color: 'var(--mn-text-3)',
  fontWeight: 600,
};

const ctaPrimaryStyle: CSSProperties = {
  height: 48,
  borderRadius: 12,
  padding: '0 18px',
  border: 'none',
  background: 'var(--mn-gradient)',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  fontFamily: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  textDecoration: 'none',
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

const ctaRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  alignItems: 'center',
};

const errorBoxStyle: CSSProperties = {
  background: '#fef2f2',
  borderRadius: 12,
  padding: '12px 16px',
  color: 'var(--mn-danger)',
  border: '1px solid #fecaca',
  margin: '14px 0',
};

const shareConfirmStyle: CSSProperties = {
  background: 'var(--mn-surface-2)',
  borderRadius: 12,
  padding: '8px 14px',
  color: 'var(--mn-text-2)',
  border: '1px solid var(--mn-border)',
  fontSize: 13,
};

function formatEur(amount: number): string {
  return amount.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDeadline(value: string | null): string | null {
  if (!value) return null;
  const time = Date.parse(value);
  if (Number.isNaN(time)) return null;
  return new Date(time).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function CrowdfundingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { campaign, status, error } = useCrowdfundingItem(id);
  const { user } = useAuth();
  const [shared, setShared] = useState<boolean>(false);

  if (status === 'notfound') {
    return <Navigate to="/services/crowdfunding" replace />;
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <main style={pageStyle}>
        <p role="status" aria-live="polite" style={{ color: 'var(--mn-text-3)' }}>
          Chargement de la cagnotte…
        </p>
      </main>
    );
  }

  if (status === 'error' || !campaign) {
    return (
      <main style={pageStyle}>
        <div role="alert" style={errorBoxStyle}>
          {postgrestErrorMessage(error) ?? 'Cagnotte introuvable.'}
        </div>
        <Link to="/services/crowdfunding" style={ctaSecondaryStyle}>
          <IconArrowLeft /> Retour à la liste
        </Link>
      </main>
    );
  }

  const handleShare = async () => {
    setShared(false);
    const url =
      typeof window !== 'undefined' ? `${window.location.origin}${location.pathname}` : '';
    const navigatorWithShare = typeof navigator !== 'undefined' ? navigator : undefined;
    if (navigatorWithShare && 'share' in navigatorWithShare) {
      try {
        await navigatorWithShare.share({ title: campaign.title, url });
        setShared(true);
        return;
      } catch {
        // fallback clipboard
      }
    }
    if (navigatorWithShare?.clipboard?.writeText && url) {
      try {
        await navigatorWithShare.clipboard.writeText(url);
        setShared(true);
      } catch {
        // ignored
      }
    }
  };

  const ratio = campaign.goal_eur > 0 ? campaign.raised_eur / campaign.goal_eur : 0;
  const percent = Math.round(Math.min(ratio, 1) * 100);
  const deadline = formatDeadline(campaign.ends_at);
  const isOrganizer = Boolean(user && user.id === campaign.organizer_id);

  return (
    <main style={pageStyle}>
      <Link to="/services/crowdfunding" style={backLinkStyle}>
        <IconArrowLeft /> Toutes les cagnottes
      </Link>
      <header style={heroStyle}>
        <span style={tagStyle}>
          <IconFlame width={14} height={14} />
          Cagnotte solidaire
        </span>
        <h1 style={titleStyle}>{campaign.title}</h1>
        <p style={summaryStyle}>{campaign.summary}</p>

        <div style={progressLabelRowStyle}>
          <span style={raisedStyle}>{formatEur(campaign.raised_eur)} € collectés</span>
          <span style={goalStyle}>
            {percent}% sur {formatEur(campaign.goal_eur)} €
          </span>
        </div>
        <div style={progressBarStyle} role="presentation">
          <div style={progressFillStyle(ratio)} />
        </div>
        {deadline && (
          <p style={goalStyle}>
            <IconCheckCircle width={14} height={14} /> Échéance : {deadline}
          </p>
        )}

        {campaign.body && <p style={bodyStyle}>{campaign.body}</p>}

        <div style={ctaRowStyle}>
          {isOrganizer ? (
            <span style={ctaSecondaryStyle} aria-label="Vous êtes l’organisateur de cette cagnotte">
              <IconFlame /> Vous êtes l’organisateur
            </span>
          ) : (
            <Link to={`/services/crowdfunding/${campaign.id}/contribute`} style={ctaPrimaryStyle}>
              <IconCart /> Contribuer
            </Link>
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
    </main>
  );
}
