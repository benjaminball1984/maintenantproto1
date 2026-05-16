import type { CSSProperties, ReactElement } from 'react';
import { Link } from 'react-router-dom';

import {
  IconBarChart,
  IconCheckCircle,
  IconFlame,
  IconShare,
  IconSpark,
  IconUsers,
} from '@/components/icons';

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

const timelineListStyle: CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: '2rem 0 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.85rem',
};

const timelineItemStyle: CSSProperties = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'flex-start',
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 12,
  padding: '1rem 1.15rem',
};

const timelineIconWrapStyle = (state: TimelineState): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 38,
  height: 38,
  borderRadius: 10,
  background:
    state === 'done'
      ? 'var(--mn-brand-light)'
      : state === 'in-progress'
      ? 'rgba(225, 29, 116, 0.10)'
      : 'var(--mn-surface-2)',
  color:
    state === 'done'
      ? 'var(--mn-brand-dark)'
      : state === 'in-progress'
      ? 'var(--mn-brand)'
      : 'var(--mn-text-3)',
  flex: 'none',
});

const timelineDateStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--mn-brand-dark)',
  margin: 0,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

const timelineTitleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: '1.05rem',
  fontWeight: 700,
  margin: '0.15rem 0 0.4rem',
  color: 'var(--mn-text-1)',
};

const timelineDescStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.55,
  color: 'var(--mn-text-2)',
  margin: 0,
};

const timelineBodyWrapStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
};

const stateBadgeStyle = (state: TimelineState): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  alignSelf: 'flex-start',
  marginTop: '0.5rem',
  padding: '0.2rem 0.6rem',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  background:
    state === 'done'
      ? 'rgba(34, 197, 94, 0.12)'
      : state === 'in-progress'
      ? 'rgba(225, 29, 116, 0.12)'
      : 'var(--mn-surface-2)',
  color:
    state === 'done'
      ? '#157347'
      : state === 'in-progress'
      ? 'var(--mn-brand-dark)'
      : 'var(--mn-text-3)',
  border: '1px solid var(--mn-border)',
});

const stateLabel: Record<TimelineState, string> = {
  done: 'Réalisé',
  'in-progress': 'En cours',
  planned: 'Planifié',
};

type TimelineState = 'done' | 'in-progress' | 'planned';

interface TimelineEntry {
  date: string;
  title: string;
  description: string;
  state: TimelineState;
  icon: ReactElement;
}

const TIMELINE: TimelineEntry[] = [
  {
    date: '2025 S2',
    title: 'Conception et statuts associatifs',
    description:
      'Choix techniques (Vite + React + Supabase, hébergement EU), design system propre, dépôt des statuts loi 1901.',
    state: 'done',
    icon: <IconCheckCircle width={18} height={18} />,
  },
  {
    date: '2026 S1',
    title: 'Lancement public — outils de base',
    description:
      'Adhésion T99CP, pétitions, mobilisations, sondages, campagnes, services d’entraide, communes libres, transparence publique.',
    state: 'in-progress',
    icon: <IconFlame width={18} height={18} />,
  },
  {
    date: '2026 S2',
    title: 'Communes libres & média militant',
    description:
      'Première vague de communes libres en France métropolitaine, ouverture du média militant, premiers partenariats locaux.',
    state: 'planned',
    icon: <IconUsers width={18} height={18} />,
  },
  {
    date: '2027 S1',
    title: 'API publique & open data',
    description:
      'Mise à disposition d’une API publique pour les compteurs de transparence, ouverture progressive du code source.',
    state: 'planned',
    icon: <IconShare width={18} height={18} />,
  },
  {
    date: '2027 S2',
    title: 'Fédération européenne',
    description:
      'Extension à des communes libres outre-mer et frontalières, échanges avec des collectifs européens.',
    state: 'planned',
    icon: <IconBarChart width={18} height={18} />,
  },
  {
    date: '2028',
    title: 'Pacte citoyen national',
    description:
      'Co-construction d’un pacte citoyen national à partir des pétitions et mobilisations à plus fort impact.',
    state: 'planned',
    icon: <IconSpark width={18} height={18} />,
  },
];

export default function RoadmapPage() {
  return (
    <main style={pageStyle}>
      <p style={eyebrowStyle}>Roadmap publique</p>
      <h1 style={h1Style}>Là où on va</h1>
      <p style={leadStyle}>
        Les jalons connus à date — du lancement public à la fédération
        européenne. La roadmap est mise à jour chaque trimestre selon la
        dynamique du mouvement et les retours des adhérent·es.
      </p>

      <ul style={timelineListStyle} aria-label="Jalons de la roadmap Maintenant !">
        {TIMELINE.map((entry) => (
          <li
            key={entry.title}
            style={timelineItemStyle}
            data-testid="roadmap-item"
            data-state={entry.state}
          >
            <span style={timelineIconWrapStyle(entry.state)} aria-hidden>
              {entry.icon}
            </span>
            <div style={timelineBodyWrapStyle}>
              <p style={timelineDateStyle}>{entry.date}</p>
              <p style={timelineTitleStyle}>{entry.title}</p>
              <p style={timelineDescStyle}>{entry.description}</p>
              <span style={stateBadgeStyle(entry.state)}>{stateLabel[entry.state]}</span>
            </div>
          </li>
        ))}
      </ul>

      <section
        style={{
          marginTop: '3.5rem',
          padding: '1.75rem 1.5rem',
          borderRadius: 14,
          background: 'var(--mn-surface-2)',
          border: '1px solid var(--mn-border)',
          textAlign: 'center',
        }}
        aria-labelledby="roadmap-cta-title"
      >
        <h2
          id="roadmap-cta-title"
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '1.3rem',
            fontWeight: 700,
            margin: '0 0 0.5rem',
            color: 'var(--mn-text-1)',
          }}
        >
          Tu veux contribuer&nbsp;?
        </h2>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.55,
            color: 'var(--mn-text-2)',
            margin: '0 0 1.25rem',
          }}
        >
          Adhère pour soutenir le développement, ou découvre comment le
          mouvement fonctionne avant de te lancer.
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.85rem',
            flexWrap: 'wrap',
          }}
        >
          <Link
            to="/join"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.4rem',
              borderRadius: 10,
              background: 'var(--mn-gradient)',
              color: '#ffffff',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Rejoindre
          </Link>
          {/* D-T01 : ancien lien /decouvrir bascule vers /about (page projet). */}
          <Link
            to="/about"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.4rem',
              borderRadius: 10,
              background: 'var(--mn-surface)',
              color: 'var(--mn-text-1)',
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid var(--mn-border)',
            }}
          >
            À propos
          </Link>
        </div>
      </section>
    </main>
  );
}
