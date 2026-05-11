import { useState, type CSSProperties, type ReactElement } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';

import {
  IconArrowLeft,
  IconBarChart,
  IconCalendar,
  IconCart,
  IconList,
  IconMegaphone,
  IconPen,
  IconShare,
} from '@/components/icons';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { useCampaign } from '@/hooks/useCampaign';
import type { CampaignActionRow } from '@/lib/campaigns';

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

const bodyStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.7,
  color: 'var(--mn-text-1)',
  margin: 0,
  whiteSpace: 'pre-wrap',
};

const actionsHeadingStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 20,
  fontWeight: 700,
  margin: '24px 0 12px',
  color: 'var(--mn-text-1)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
};

const actionsListStyle: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};

const actionCardStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '16px 18px',
  borderRadius: 14,
  border: '1.5px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  textDecoration: 'none',
  color: 'inherit',
  transition: 'border-color 120ms ease, transform 120ms ease',
};

const actionIconStyle: CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 12,
  background: 'var(--mn-brand-light)',
  color: 'var(--mn-brand-dark)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const actionTextStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  flex: 1,
  minWidth: 0,
};

const actionLabelStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: 15,
  color: 'var(--mn-text-1)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const actionKindStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--mn-text-3)',
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

const orphanCardStyle: CSSProperties = {
  ...actionCardStyle,
  cursor: 'default',
  opacity: 0.7,
};

type ActionKind = 'petition' | 'mobilization' | 'poll' | 'crowdfunding' | 'unknown';

interface ActionRoute {
  kind: ActionKind;
  href: string | null;
  fallbackLabel: string;
  icon: ReactElement;
}

function resolveAction(action: CampaignActionRow): ActionRoute {
  if (action.petition_id) {
    return {
      kind: 'petition',
      href: `/petitions/${action.petition_id}`,
      fallbackLabel: 'Pétition',
      icon: <IconPen width={20} height={20} />,
    };
  }
  if (action.mobilization_id) {
    return {
      kind: 'mobilization',
      href: `/mobilizations/${action.mobilization_id}`,
      fallbackLabel: 'Mobilisation',
      icon: <IconCalendar width={20} height={20} />,
    };
  }
  if (action.poll_id) {
    return {
      kind: 'poll',
      href: `/polls/${action.poll_id}`,
      fallbackLabel: 'Sondage',
      icon: <IconBarChart width={20} height={20} />,
    };
  }
  if (action.crowdfunding_id) {
    return {
      kind: 'crowdfunding',
      href: `/services/crowdfunding/${action.crowdfunding_id}`,
      fallbackLabel: 'Cagnotte',
      icon: <IconCart width={20} height={20} />,
    };
  }
  return {
    kind: 'unknown',
    href: null,
    fallbackLabel: 'Action',
    icon: <IconMegaphone width={20} height={20} />,
  };
}

function kindLabel(kind: ActionKind): string {
  switch (kind) {
    case 'petition':
      return 'Pétition';
    case 'mobilization':
      return 'Mobilisation';
    case 'poll':
      return 'Sondage';
    case 'crowdfunding':
      return 'Cagnotte';
    default:
      return 'Action';
  }
}

export default function CampaignDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { campaign, actions, status, error } = useCampaign(slug);
  const [shared, setShared] = useState<boolean>(false);

  if (status === 'notfound') {
    return <Navigate to="/campaigns" replace />;
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <main style={pageStyle}>
        <p role="status" aria-live="polite" style={{ color: 'var(--mn-text-3)' }}>
          Chargement de la campagne…
        </p>
      </main>
    );
  }

  if (status === 'error' || !campaign) {
    return (
      <main style={pageStyle}>
        <div role="alert" style={errorBoxStyle}>
          {postgrestErrorMessage(error) ?? 'Campagne introuvable.'}
        </div>
        <Link to="/campaigns" style={ctaSecondaryStyle}>
          <IconArrowLeft /> Retour aux campagnes
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

  return (
    <main style={pageStyle}>
      <Link to="/campaigns" style={backLinkStyle}>
        <IconArrowLeft /> Toutes les campagnes
      </Link>
      <header style={headerStyle}>
        <span style={tagStyle}>
          <IconMegaphone width={14} height={14} />
          Campagne citoyenne
        </span>
        <h1 style={titleStyle}>{campaign.title}</h1>
        <p style={summaryStyle}>{campaign.summary}</p>
        {campaign.body && <p style={bodyStyle}>{campaign.body}</p>}

        <div style={ctaRowStyle}>
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

      <h2 style={actionsHeadingStyle}>
        <IconList />
        {actions.length} action{actions.length > 1 ? 's' : ''} dans cette campagne
      </h2>

      <ul aria-label="Actions de la campagne" style={actionsListStyle}>
        {actions.map((action) => {
          const route = resolveAction(action);
          const label = action.label?.trim() || route.fallbackLabel;
          const content = (
            <>
              <span style={actionIconStyle} aria-hidden="true">
                {route.icon}
              </span>
              <span style={actionTextStyle}>
                <span style={actionKindStyle}>{kindLabel(route.kind)}</span>
                <span style={actionLabelStyle}>{label}</span>
              </span>
            </>
          );
          if (!route.href) {
            return (
              <li key={action.id}>
                <div style={orphanCardStyle} aria-label="Action sans cible (lien rompu)">
                  {content}
                </div>
              </li>
            );
          }
          return (
            <li key={action.id}>
              <Link to={route.href} style={actionCardStyle}>
                {content}
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
