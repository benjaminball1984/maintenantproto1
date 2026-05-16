import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import { IconSpark } from '@/components/icons';

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

const sectionStyle: CSSProperties = {
  marginTop: '3rem',
};

const h2Style: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  margin: '0 0 0.75rem',
  color: 'var(--mn-text-1)',
};

const paragraphStyle: CSSProperties = {
  fontSize: 16,
  lineHeight: 1.7,
  color: 'var(--mn-text-2)',
  margin: '0 0 1rem',
};

const historyListStyle: CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: '1.5rem 0 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.9rem',
};

const historyItemStyle: CSSProperties = {
  display: 'flex',
  gap: '0.85rem',
  alignItems: 'flex-start',
};

const historyDateStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--mn-brand-dark)',
  background: 'var(--mn-brand-light)',
  borderRadius: 6,
  padding: '0.25rem 0.55rem',
  flex: 'none',
  minWidth: 86,
  textAlign: 'center',
};

const historyBodyStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.55,
  color: 'var(--mn-text-2)',
  margin: 0,
};

interface HistoryItem {
  date: string;
  label: string;
}

const HISTORY: HistoryItem[] = [
  {
    date: '2024',
    label:
      'Premières discussions entre Ben, Lilou et un cercle de proches autour du besoin d’outils citoyens indépendants.',
  },
  {
    date: '2025 S1',
    label:
      'Conception du prototype et choix techniques : Vite + React + Supabase, hébergement EU, design system propre.',
  },
  {
    date: '2025 S2',
    label:
      'Statuts associatifs déposés. Première version privée testée par un cercle d’adhérent·es.',
  },
  {
    date: '2026 S1',
    label:
      'Lancement public du site et de l’adhésion T99CP. Ouverture progressive des outils (pétitions, mobilisations, services).',
  },
  {
    date: '2026 S2',
    label:
      'Première communauté de communes libres, ouverture du média militant, premiers partenariats locaux.',
  },
];

export default function AboutPage() {
  return (
    <main style={pageStyle}>
      {/* D-017 : eyebrow révisée, D-019 : lead supprimé, D-020 / D-021 :
          sections Équipe et Valeurs supprimées. Reste H1, Historique et CTA. */}
      <p style={eyebrowStyle}>Le projet en quelques mots</p>
      <h1 style={h1Style}>À propos de Maintenant&nbsp;!</h1>

      <section style={sectionStyle} aria-labelledby="about-history-title">
        <h2 id="about-history-title" style={h2Style}>
          Historique
        </h2>
        <p style={paragraphStyle}>
          Quelques jalons clés de la naissance du mouvement et des étapes à
          venir.
        </p>
        <ul style={historyListStyle}>
          {HISTORY.map((item) => (
            <li key={item.date} style={historyItemStyle}>
              <span style={historyDateStyle}>{item.date}</span>
              <p style={historyBodyStyle}>{item.label}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        style={{
          marginTop: '3.5rem',
          padding: '2rem 1.5rem',
          borderRadius: 16,
          background: 'var(--mn-surface-2)',
          border: '1px solid var(--mn-border)',
          textAlign: 'center',
        }}
        aria-labelledby="about-cta-title"
      >
        <h2 id="about-cta-title" style={{ ...h2Style, margin: '0 0 0.5rem' }}>
          Envie de rejoindre le mouvement&nbsp;?
        </h2>
        <p
          style={{
            ...paragraphStyle,
            fontSize: 15,
            margin: '0 0 1.25rem',
          }}
        >
          L’adhésion est libre, à prix libre à partir de 0&nbsp;€. Aucune
          condition de revenu ni d’engagement.
        </p>
        {/* D-T01 : ancien CTA vers /decouvrir bascule vers /join (espace Agir). */}
        <Link
          to="/join"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '0.85rem 1.6rem',
            borderRadius: 12,
            background: 'var(--mn-gradient)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: 16,
            textDecoration: 'none',
          }}
        >
          <IconSpark width={18} height={18} aria-hidden />
          Rejoindre le mouvement
        </Link>
      </section>
    </main>
  );
}
