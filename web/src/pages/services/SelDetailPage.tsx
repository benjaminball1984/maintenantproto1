import { useState, type CSSProperties } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';

import {
  IconArrowLeft,
  IconBadge,
  IconList,
  IconPin,
  IconShare,
  IconSpark,
} from '@/components/icons';
import { useAuth } from '@/lib/auth';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { useSelItem } from '@/hooks/useSelItem';

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

const metaRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 16,
  fontSize: 14,
  color: 'var(--mn-text-2)',
};

const metaItemStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontWeight: 600,
};

const descriptionStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.7,
  color: 'var(--mn-text-1)',
  margin: 0,
  whiteSpace: 'pre-wrap',
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

export default function SelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { offer, status, error } = useSelItem(id);
  const { user } = useAuth();
  const [shared, setShared] = useState<boolean>(false);

  if (status === 'notfound') {
    return <Navigate to="/services/sel" replace />;
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <main style={pageStyle}>
        <p role="status" aria-live="polite" style={{ color: 'var(--mn-text-3)' }}>
          Chargement de l’offre…
        </p>
      </main>
    );
  }

  if (status === 'error' || !offer) {
    return (
      <main style={pageStyle}>
        <div role="alert" style={errorBoxStyle}>
          {postgrestErrorMessage(error) ?? 'Offre introuvable.'}
        </div>
        <Link to="/services/sel" style={ctaSecondaryStyle}>
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
        await navigatorWithShare.share({ title: offer.title, url });
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

  const isOwner = Boolean(user && user.id === offer.user_id);

  return (
    <main style={pageStyle}>
      <Link to="/services/sel" style={backLinkStyle}>
        <IconArrowLeft /> Toutes les offres SEL
      </Link>
      <header style={heroStyle}>
        <span style={tagStyle}>
          <IconList width={14} height={14} />
          {offer.category}
        </span>
        <h1 style={titleStyle}>{offer.title}</h1>
        <div style={metaRowStyle}>
          <span style={metaItemStyle}>
            <IconPin width={16} height={16} />
            {offer.city}
          </span>
          <span style={metaItemStyle}>
            <IconBadge width={16} height={16} />
            {offer.t99cp_rate} T99CP / unité
          </span>
        </div>
        {offer.description && <p style={descriptionStyle}>{offer.description}</p>}

        <div style={ctaRowStyle}>
          {isOwner ? (
            <span style={ctaSecondaryStyle} aria-label="Vous êtes l’auteur de cette offre">
              <IconSpark /> Vous êtes l’auteur
            </span>
          ) : null}
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
