import { useState, type CSSProperties } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';

import ContactAuthorButton from '@/components/ContactAuthorButton';
import {
  IconArrowLeft,
  IconBadge,
  IconCart,
  IconPin,
  IconShare,
} from '@/components/icons';
import { useAuth } from '@/lib/auth';
import { type MarketplaceItemRow } from '@/lib/marketplace';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { useMarketplaceItem } from '@/hooks/useMarketplaceItem';

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

const soldBadgeStyle: CSSProperties = {
  ...tagStyle,
  background: '#fee2e2',
  color: '#9b1c1c',
};

function formatPrice(item: MarketplaceItemRow): string {
  if (item.price_eur !== null && item.price_eur !== undefined) {
    return `${item.price_eur.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })} €`;
  }
  if (item.t99cp_cost !== null && item.t99cp_cost !== undefined) {
    return `${item.t99cp_cost} T99CP`;
  }
  return 'Sur demande';
}

export default function MarketplaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { item, status, error } = useMarketplaceItem(id);
  const { user } = useAuth();
  const [shared, setShared] = useState<boolean>(false);

  if (status === 'notfound') {
    return <Navigate to="/services/marketplace" replace />;
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <main style={pageStyle}>
        <p role="status" aria-live="polite" style={{ color: 'var(--mn-text-3)' }}>
          Chargement de l’annonce…
        </p>
      </main>
    );
  }

  if (status === 'error' || !item) {
    return (
      <main style={pageStyle}>
        <div role="alert" style={errorBoxStyle}>
          {postgrestErrorMessage(error) ?? 'Annonce introuvable.'}
        </div>
        <Link to="/services/marketplace" style={ctaSecondaryStyle}>
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
        await navigatorWithShare.share({ title: item.title, url });
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

  const isOwner = Boolean(user && user.id === item.seller_id);

  return (
    <main style={pageStyle}>
      <Link to="/services/marketplace" style={backLinkStyle}>
        <IconArrowLeft /> Toutes les annonces
      </Link>
      <header style={heroStyle}>
        <span style={tagStyle}>
          <IconCart width={14} height={14} />
          {item.category}
        </span>
        <h1 style={titleStyle}>{item.title}</h1>
        {item.is_sold && (
          <span style={soldBadgeStyle} role="status">
            Annonce clôturée
          </span>
        )}
        <div style={metaRowStyle}>
          <span style={metaItemStyle}>
            <IconPin width={16} height={16} />
            {item.city}
          </span>
          <span style={metaItemStyle}>
            <IconBadge width={16} height={16} />
            {formatPrice(item)}
          </span>
        </div>
        {item.description && <p style={descriptionStyle}>{item.description}</p>}

        <div style={ctaRowStyle}>
          {isOwner ? (
            <span style={ctaSecondaryStyle} aria-label="Vous êtes le vendeur de cette annonce">
              <IconCart /> Vous êtes le vendeur
            </span>
          ) : (
            !item.is_sold && <ContactAuthorButton authorUserId={item.seller_id} />
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
