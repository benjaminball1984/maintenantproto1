import type { CSSProperties, ReactElement } from 'react';
import { Link } from 'react-router-dom';

import {
  IconBadge,
  IconFlame,
  IconShare,
  IconSpark,
  IconUser,
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
  alignItems: 'flex-start',
  gap: '0.5rem',
};

const avatarPlaceholderStyle: CSSProperties = {
  width: 56,
  height: 56,
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
  fontWeight: 600,
  color: 'var(--mn-brand-dark)',
  margin: 0,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
};

const teamBioStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.55,
  color: 'var(--mn-text-2)',
  margin: 0,
};

const teamDemoBadgeStyle: CSSProperties = {
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
  marginTop: '0.4rem',
};

const valuesGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '1rem',
  margin: '1.5rem 0 0',
};

const valueCardStyle: CSSProperties = {
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
  gap: '0.25rem',
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
  minWidth: 86,
  textAlign: 'center',
};

const historyBodyStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.55,
  color: 'var(--mn-text-2)',
  margin: 0,
};

interface TeamMember {
  initials: string;
  name: string;
  role: string;
  bio: string;
}

const TEAM: TeamMember[] = [
  {
    initials: 'B',
    name: 'Ben',
    role: 'Co-fondateur·rice — produit',
    bio: 'Pilote l’architecture produit, la roadmap et la relation avec la communauté des adhérent·es.',
  },
  {
    initials: 'L',
    name: 'Lilou',
    role: 'Co-fondateur·rice — opérations',
    bio: 'Coordonne la modération, les communes libres et les partenariats locaux.',
  },
  {
    initials: '+',
    name: 'L’équipe bénévole',
    role: 'Contributions ponctuelles',
    bio: 'Une dizaine de bénévoles contribuent au code, à la modération et à l’organisation des mobilisations.',
  },
];

interface ValueDef {
  icon: ReactElement;
  title: string;
  description: string;
}

const VALUES: ValueDef[] = [
  {
    icon: <IconUsers width={18} height={18} />,
    title: 'Citoyen·nes d’abord',
    description:
      'Le mouvement appartient à ses adhérent·es. Aucune publicité, aucun investisseur, aucune dépendance commerciale.',
  },
  {
    icon: <IconShare width={18} height={18} />,
    title: 'Transparence radicale',
    description:
      'Tous les compteurs sont publics. Les décisions de modération sont documentées. Le code source est ouvert progressivement.',
  },
  {
    icon: <IconBadge width={18} height={18} />,
    title: 'Sobriété & éthique',
    description:
      'Pas de tracking, pas de profilage, pas de notifications agressives. Hébergement EU, données minimales.',
  },
  {
    icon: <IconFlame width={18} height={18} />,
    title: 'Action concrète',
    description:
      'Les outils servent à agir : signer, organiser, échanger. Pas à scroller indéfiniment.',
  },
  {
    icon: <IconUser width={18} height={18} />,
    title: 'Inclusion sans condition',
    description:
      'L’adhésion est libre dès 1 €. Personne n’est exclu pour des raisons financières.',
  },
];

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
      'Conception du prototype et choix techniques : Vite + React + Supabase, hébergement EU, design system propre.',
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
      <p style={eyebrowStyle}>Qui sommes-nous</p>
      <h1 style={h1Style}>À propos de Maintenant&nbsp;!</h1>
      <p style={leadStyle}>
        Maintenant&nbsp;! est une association loi 1901 indépendante, sans
        publicité ni pistage, qui rassemble les outils numériques nécessaires
        à l&rsquo;action citoyenne. Voici qui porte le projet, ce qui nous
        guide et d&rsquo;où on vient.
      </p>

      <section style={sectionStyle} aria-labelledby="about-team-title">
        <h2 id="about-team-title" style={h2Style}>
          L&rsquo;équipe
        </h2>
        <p style={paragraphStyle}>
          Une équipe restreinte au démarrage, élargie au fil des contributions.
          Les profils ci-dessous sont des placeholders pendant la phase de
          lancement&nbsp;: ils seront remplacés par les bios validées des
          membres au plus tard à T+3&nbsp;mois.
        </p>
        <ul style={{ ...teamGridStyle, listStyle: 'none', padding: 0 }}>
          {TEAM.map((member) => (
            <li key={member.name} style={teamCardStyle}>
              <span style={avatarPlaceholderStyle} aria-hidden>
                {member.initials}
              </span>
              <p style={teamNameStyle}>{member.name}</p>
              <p style={teamRoleStyle}>{member.role}</p>
              <p style={teamBioStyle}>{member.bio}</p>
              <span style={teamDemoBadgeStyle} data-testid="about-team-demo-badge">
                Bio démo
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section style={sectionStyle} aria-labelledby="about-values-title">
        <h2 id="about-values-title" style={h2Style}>
          Nos valeurs
        </h2>
        <p style={paragraphStyle}>
          Cinq piliers qui orientent toutes nos décisions, des choix de design
          aux décisions de gouvernance.
        </p>
        <ul style={{ ...valuesGridStyle, listStyle: 'none', padding: 0 }}>
          {VALUES.map((value) => (
            <li key={value.title} style={valueCardStyle}>
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
          Envie d&rsquo;en savoir plus&nbsp;?
        </h2>
        <p
          style={{
            ...paragraphStyle,
            fontSize: 15,
            margin: '0 0 1.25rem',
          }}
        >
          Découvre la mission complète, les outils et la roadmap publique.
        </p>
        <Link
          to="/decouvrir"
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
          Découvrir le mouvement
        </Link>
      </section>
    </main>
  );
}
