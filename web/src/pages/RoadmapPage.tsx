import type { CSSProperties, ReactElement } from 'react';
import { Link } from 'react-router-dom';

import {
  IconCalendar,
  IconCheckCircle,
  IconFlame,
  IconShare,
  IconSpark,
} from '@/components/icons';

import { ROADMAP_ITEMS, type RoadmapItemDef, type RoadmapItemStatus } from './roadmapData';

const pageStyle: CSSProperties = {
  maxWidth: 880,
  margin: '0 auto',
  padding: 'clamp(2.5rem, 5vw, 4rem) 1.5rem 4rem',
  color: 'var(--mn-text-1)',
  lineHeight: 1.65,
};

const eyebrowStyle: CSSProperties = {
  display: 'inline-block',
  padding: '0.4rem 0.85rem',
  borderRadius: 999,
  background: 'var(--mn-brand-light)',
  color: 'var(--mn-brand-dark)',
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: '0.02em',
  margin: '0 0 1rem',
};

const h1Style: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 'clamp(2rem, 5vw, 3rem)',
  fontWeight: 700,
  letterSpacing: '-0.03em',
  lineHeight: 1.1,
  margin: '0 0 1rem',
  color: 'var(--mn-text-1)',
};

const leadStyle: CSSProperties = {
  fontSize: 'clamp(1rem, 2vw, 1.15rem)',
  lineHeight: 1.6,
  color: 'var(--mn-text-2)',
  margin: '0 0 2.5rem',
};

const legendStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
  marginBottom: '2rem',
  padding: '0.85rem 1rem',
  background: 'var(--mn-surface-2)',
  border: '1px solid var(--mn-border)',
  borderRadius: 12,
  fontSize: 13,
  color: 'var(--mn-text-2)',
};

const legendItemStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
};

const timelineStyle: CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  position: 'relative',
};

const itemRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '110px 32px 1fr',
  gap: '0.85rem',
  alignItems: 'flex-start',
  padding: '0.85rem 0',
};

const dateBadgeStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--mn-brand-dark)',
  background: 'var(--mn-brand-light)',
  borderRadius: 6,
  padding: '0.3rem 0.6rem',
  textAlign: 'center',
};

const iconColumnStyle: CSSProperties = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const iconBubbleBaseStyle: CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid',
  background: 'var(--mn-surface)',
  flex: 'none',
};

const connectorStyle: CSSProperties = {
  width: 2,
  flex: 1,
  background: 'var(--mn-border)',
  marginTop: 2,
};

const bodyStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  paddingTop: 2,
};

const titleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: '1.05rem',
  fontWeight: 700,
  margin: 0,
  color: 'var(--mn-text-1)',
};

const descStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.55,
  color: 'var(--mn-text-2)',
  margin: 0,
};

const statusLabelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginTop: 2,
};

const STATUS_COLORS: Record<RoadmapItemStatus, { border: string; text: string; label: string }> = {
  done: {
    border: 'var(--mn-success)',
    text: 'var(--mn-success)',
    label: 'Livré',
  },
  'in-progress': {
    border: 'var(--mn-brand)',
    text: 'var(--mn-brand)',
    label: 'En cours',
  },
  planned: {
    border: 'var(--mn-border-dark)',
    text: 'var(--mn-text-3)',
    label: 'Planifié',
  },
};

function renderStatusIcon(status: RoadmapItemStatus): ReactElement {
  if (status === 'done') {
    return <IconCheckCircle width={16} height={16} aria-hidden />;
  }
  if (status === 'in-progress') {
    return <IconFlame width={16} height={16} aria-hidden />;
  }
  return <IconCalendar width={16} height={16} aria-hidden />;
}

interface TimelineItemProps {
  item: RoadmapItemDef;
  isLast: boolean;
}

function TimelineItem({ item, isLast }: TimelineItemProps) {
  const palette = STATUS_COLORS[item.status];
  const bubbleStyle: CSSProperties = {
    ...iconBubbleBaseStyle,
    borderColor: palette.border,
    color: palette.text,
  };
  return (
    <li
      style={itemRowStyle}
      data-testid={`roadmap-item-${item.id}`}
      data-status={item.status}
      aria-label={`${item.date} — ${item.title} (${palette.label})`}
    >
      <span style={dateBadgeStyle}>{item.date}</span>
      <span style={iconColumnStyle} aria-hidden>
        <span style={bubbleStyle}>{renderStatusIcon(item.status)}</span>
        {isLast ? null : <span style={connectorStyle} />}
      </span>
      <span style={bodyStyle}>
        <span style={titleStyle}>{item.title}</span>
        <span style={descStyle}>{item.description}</span>
        <span style={{ ...statusLabelStyle, color: palette.text }}>{palette.label}</span>
      </span>
    </li>
  );
}

const linkStyle: CSSProperties = {
  color: 'var(--mn-brand)',
  fontWeight: 600,
};

export default function RoadmapPage() {
  return (
    <main style={pageStyle}>
      <p style={eyebrowStyle}>Roadmap publique</p>
      <h1 style={h1Style}>Notre feuille de route 2026 — 2028</h1>
      <p style={leadStyle}>
        Les jalons publics du mouvement Maintenant&nbsp;! Mise à jour à chaque
        AG associative trimestrielle. Tu peux contribuer aux chantiers via la{' '}
        <Link to="/legal/contact" style={linkStyle}>page Contact</Link>.
      </p>

      <div style={legendStyle} role="note" aria-label="Légende des statuts">
        <span style={legendItemStyle}>
          <IconCheckCircle width={14} height={14} aria-hidden style={{ color: 'var(--mn-success)' }} />
          <strong style={{ color: 'var(--mn-success)' }}>Livré</strong>
        </span>
        <span style={legendItemStyle}>
          <IconFlame width={14} height={14} aria-hidden style={{ color: 'var(--mn-brand)' }} />
          <strong style={{ color: 'var(--mn-brand)' }}>En cours</strong>
        </span>
        <span style={legendItemStyle}>
          <IconCalendar width={14} height={14} aria-hidden style={{ color: 'var(--mn-text-3)' }} />
          <strong style={{ color: 'var(--mn-text-3)' }}>Planifié</strong>
        </span>
      </div>

      <ol style={timelineStyle} data-testid="roadmap-timeline">
        {ROADMAP_ITEMS.map((item, idx) => (
          <TimelineItem
            key={item.id}
            item={item}
            isLast={idx === ROADMAP_ITEMS.length - 1}
          />
        ))}
      </ol>

      <p style={{ fontSize: 14, color: 'var(--mn-text-3)', marginTop: '2.5rem' }}>
        <IconShare width={14} height={14} aria-hidden /> Pour le détail des
        livrables techniques en cours, voir le journal interne{' '}
        <code>HANDOFF-PROGRESS.md</code> sur le dépôt public.
      </p>
      <p style={{ fontSize: 14, color: 'var(--mn-text-3)', marginTop: '0.5rem' }}>
        <IconSpark width={14} height={14} aria-hidden /> Tu veux participer aux
        chantiers planifiés&nbsp;? Visite la{' '}
        <Link to="/about" style={linkStyle}>page À propos</Link> et la{' '}
        <Link to="/decouvrir" style={linkStyle}>page Découvrir</Link>.
      </p>
    </main>
  );
}
