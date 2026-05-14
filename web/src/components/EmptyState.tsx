import type { CSSProperties, ReactElement } from 'react';
import { Link } from 'react-router-dom';

export interface EmptyStateCta {
  to: string;
  label: string;
}

export interface EmptyStateProps {
  /** Icon ICONS.* — rendu décoratif (aria-hidden via le wrapper). */
  icon: ReactElement;
  /** Titre (h3 visuellement, mais on garde un `<p>` typographique pour ne
   *  pas perturber la hiérarchie de headings de la page hôte). */
  title: string;
  /** Microcopie sous le titre. */
  description: string;
  /** CTA optionnel (lien interne uniquement — `<Link>` react-router). */
  cta?: EmptyStateCta;
  /** Test id propagé pour identifier l'instance dans une page hôte. */
  testId?: string;
}

const wrapperStyle: CSSProperties = {
  border: '1px dashed var(--mn-border)',
  borderRadius: 16,
  padding: '40px 24px',
  textAlign: 'center',
  background: 'var(--mn-surface)',
  maxWidth: 480,
  margin: '24px auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
};

const iconWrapStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: 12,
  background: 'var(--mn-brand-light)',
  color: 'var(--mn-brand-dark)',
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontFamily: "'Sora', sans-serif",
  fontSize: '1.1rem',
  fontWeight: 700,
  color: 'var(--mn-text-1)',
};

const descStyle: CSSProperties = {
  margin: 0,
  color: 'var(--mn-text-2)',
  fontSize: 14,
  lineHeight: 1.55,
};

const ctaStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  marginTop: 6,
  padding: '10px 18px',
  borderRadius: 10,
  background: 'var(--mn-gradient)',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: 14,
  textDecoration: 'none',
};

export default function EmptyState({
  icon,
  title,
  description,
  cta,
  testId,
}: EmptyStateProps) {
  return (
    <div
      style={wrapperStyle}
      role="note"
      data-testid={testId}
    >
      <span style={iconWrapStyle} aria-hidden>
        {icon}
      </span>
      <p style={titleStyle}>{title}</p>
      <p style={descStyle}>{description}</p>
      {cta ? (
        <Link to={cta.to} style={ctaStyle}>
          {cta.label}
        </Link>
      ) : null}
    </div>
  );
}
