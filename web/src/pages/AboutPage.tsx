import type { CSSProperties, ReactElement } from 'react';
import { Link } from 'react-router-dom';

import {
  IconBadge,
  IconCalendar,
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

const teamGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '1.25rem',
  margin: '1.5rem 0 0',
};

const teamCardStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 14,
  padding: '1.25rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: '0.5rem',
};

const teamAvatarStyle: CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  background: 'var(--mn-brand-light)',
  color: 'var(--mn-brand-dark)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: "'Sora', sans-serif",
  fontSize: 22,
  fontWeight: 700,
};

const teamNameStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: '1.05rem',
  fontWeight: 700,
  margin: 0,
  color: 'var(--mn-text-1)',
};

const teamRoleStyle: CSSProperties = {
  fontSize: 13,
  color: 'var(--mn-brand-dark)',
  fontWeight: 600,
  margin: 0,
};

const teamBioStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.55,
  color: 'var(--mn-text-2)',
  margin: '0.35rem 0 0',
};

const demoBadgeStyle: CSSProperties = {
  display: 'inline-block',
  padding: '0.15rem 0.55rem',
  borderRadius: 6,
  background: 'var(--mn-surface-2)',
  border: '1px dashed var(--mn-border-dark)',
  color: 'var(--mn-text-3)',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  margin: '0 0 0.6rem',
};

const valuesGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '1rem',
  margin: '1.5rem 0 0',
};

const valueItemStyle: CSSProperties = {
  display: 'flex',
  gap: '0.85rem',
  alignItems: 'flex-start',
  background: 'var(--mn-surface-2)',
  border: '1px solid var(--mn-border)',
  borderRadius: 12,
  padding: '1rem 1.1rem',
};

const valueIconWrapStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: 10,
  background: 'var(--mn-brand-light)',
  color: 'var(--mn-brand-dark)',
  flex: 'none',
};

const valueTextWrapStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
};

const valueTitleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 15,
  fontWeight: 700,
  margin: 0,
  color: 'var(--mn-text-1)',
};

const valueDescStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.5,
  color: 'var(--mn-text-2)',
  margin: 0,
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
  minWidth: 92,
  textAlign: 'center',
};

const historyBodyStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.55,
  color: 'var(--mn-text-2)',
  margin: 0,
};

const linkBrandStyle: CSSProperties = {
  color: 'var(--mn-brand)',
  fontWeight: 600,
};

interface TeamMember {
  initials: string;
  name: string;
  role: string;
  bio: string;
}

const TEAM: TeamMember[] = [
  {
    initials: 'BB',
    name: 'Ben',
    role: 'Co-fondateur · produit',
    bio: 'Conception du mouvement et stratégie produit. Anciennement designer dans la tech, militant local depuis 2020.',
  },
  {
    initials: 'LL',
    name: 'Lilou',
    role: 'Co-fondatrice · communication',
    bio: 'Direction éditoriale du média et coordination des communes libres. Background journalisme indépendant.',
  },
  {
    initials: 'CL',
    name: 'Claude',
    role: 'Ingénierie & plateforme',
    bio: 'Mise en œuvre technique (Vite + Supabase) et automatisation des workflows. Approche open-source progressif.',
  },
];

interface Value {
  id: string;
  title: string;
  description: string;
  icon: ReactElement;
}

const VALUES: Value[] = [
  {
    id: 'independence',
    title: 'Indépendance',
    description:
      'Pas de publicité, pas d’investisseurs privés, pas de pistage. Le financement vient des adhérent·es uniquement.',
    icon: <IconSpark width={18} height={18} />,
  },
  {
    id: 'transparency',
    title: 'Transparence radicale',
    description:
      'Tous les compteurs sont publics, la gouvernance est documentée, le code source est progressivement libéré.',
    icon: <IconShare width={18} height={18} />,
  },
  {
    id: 'horizontality',
    title: 'Horizontalité',
    description:
      'Décisions associatives prises en AG. Les communes libres ont leur autonomie de fonctionnement.',
    icon: <IconUsers width={18} height={18} />,
  },
  {
    id: 'utility',
    title: 'Utilité concrète',
    description:
      'Les outils servent l’action : pétitions, mobilisations, entraide. Pas de gadget, pas de gamification.',
    icon: <IconFlame width={18} height={18} />,
  },
  {
    id: 'privacy',
    title: 'Respect des données',
    description:
      'Conformité RGPD stricte, hébergement UE, droit à l’oubli effectif, purge automatique des données sensibles.',
    icon: <IconBadge width={18} height={18} />,
  },
];

interface HistoryEntry {
  period: string;
  label: string;
}

const HISTORY: HistoryEntry[] = [
  {
    period: '2025 T1',
    label:
      'Lancement du projet par Ben & Lilou — premiers ateliers de cadrage avec un noyau de citoyen·nes engagé·es.',
  },
  {
    period: '2025 T3',
    label:
      'Prototype HTML publié pour validation des usages. Premières communes libres identifiées dans 5 villes pilotes.',
  },
  {
    period: '2026 T1',
    label:
      'Bascule vers la plateforme web Vite + React + Supabase. Migration progressive page par page.',
  },
  {
    period: '2026 T2',
    label:
      'Mise en service publique sur maintenant-le-mouvement.netlify.app. 1ᵉʳ adhérent T99CP comptabilisé.',
  },
  {
    period: '2026 T3',
    label:
      'Ouverture des outils d’entraide (covoiturage, lending, SEL) et du média militant.',
  },
];

export default function AboutPage() {
  return (
    <main style={pageStyle}>
      <p style={eyebrowStyle}>Notre histoire & nos valeurs</p>
      <h1 style={h1Style}>À propos du mouvement Maintenant&nbsp;!</h1>
      <p style={leadStyle}>
        Une plateforme citoyenne née d’un constat&nbsp;: les outils numériques
        actuels concentrent l’attention et la donnée entre quelques mains.
        Maintenant&nbsp;! propose une alternative associative, indépendante et
        transparente.
      </p>

      <section style={sectionStyle} aria-labelledby="about-team-title" data-testid="about-team">
        <h2 id="about-team-title" style={h2Style}>
          L’équipe
        </h2>
        <p style={paragraphStyle}>
          Une équipe restreinte au démarrage, ouverte aux contributions
          bénévoles via les communes libres et la page{' '}
          <Link to="/legal/contact" style={linkBrandStyle}>Contact</Link>.
        </p>
        <ul style={{ ...teamGridStyle, listStyle: 'none', padding: 0 }}>
          {TEAM.map((member) => (
            <li key={member.name} style={teamCardStyle}>
              <span style={teamAvatarStyle} aria-hidden>
                {member.initials}
              </span>
              <span
                style={demoBadgeStyle}
                data-testid="about-team-demo-badge"
              >
                Profil démo
              </span>
              <p style={teamNameStyle}>{member.name}</p>
              <p style={teamRoleStyle}>{member.role}</p>
              <p style={teamBioStyle}>{member.bio}</p>
            </li>
          ))}
        </ul>
      </section>

      <section style={sectionStyle} aria-labelledby="about-values-title" data-testid="about-values">
        <h2 id="about-values-title" style={h2Style}>
          Nos valeurs
        </h2>
        <p style={paragraphStyle}>
          Cinq piliers structurent toutes nos décisions — produit, technique,
          éditorial, gouvernance.
        </p>
        <ul style={{ ...valuesGridStyle, listStyle: 'none', padding: 0 }}>
          {VALUES.map((value) => (
            <li key={value.id} style={valueItemStyle} data-testid={`about-value-${value.id}`}>
              <span style={valueIconWrapStyle} aria-hidden>
                {value.icon}
              </span>
              <span style={valueTextWrapStyle}>
                <span style={valueTitleStyle}>{value.title}</span>
                <span style={valueDescStyle}>{value.description}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section
        style={sectionStyle}
        aria-labelledby="about-history-title"
        data-testid="about-history"
      >
        <h2 id="about-history-title" style={h2Style}>
          <IconCalendar width={18} height={18} aria-hidden /> Quelques dates
          clés
        </h2>
        <p style={paragraphStyle}>
          Les grandes étapes du projet depuis sa conception.
        </p>
        <ul style={historyListStyle}>
          {HISTORY.map((entry) => (
            <li key={entry.period} style={historyItemStyle}>
              <span style={historyDateStyle}>{entry.period}</span>
              <p style={historyBodyStyle}>{entry.label}</p>
            </li>
          ))}
        </ul>
      </section>

      <p style={{ ...paragraphStyle, marginTop: '3rem', fontSize: 14, color: 'var(--mn-text-3)' }}>
        Tu veux contribuer&nbsp;? La{' '}
        <Link to="/roadmap" style={linkBrandStyle}>roadmap publique</Link> détaille
        les chantiers à venir, et la{' '}
        <Link to="/legal/contact" style={linkBrandStyle}>page Contact</Link> est
        le bon canal pour proposer ton aide.
      </p>
    </main>
  );
}
