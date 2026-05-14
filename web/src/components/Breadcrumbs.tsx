import { Fragment, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

/**
 * Fil d'Ariane réutilisable (étape 38).
 *
 * Sémantique : `<nav aria-label="Fil d'Ariane">` + `<ol>` ; le dernier
 * item n'est pas un lien (page courante, attribut `aria-current="page"`).
 * Les séparateurs `›` sont `aria-hidden` (redondance visuelle, pas lus
 * par les screen readers).
 *
 * @param items   Liste ordonnée du plus général au plus spécifique. Le
 *                dernier item est rendu en page courante sans `to`.
 *                Exemples : `[{ label: 'Pétitions', to: '/petitions' }, { label: 'Ma pétition' }]`.
 */
export interface BreadcrumbItem {
  label: string;
  /** URL interne. Si omis, l'item est rendu en page courante (non cliquable). */
  to?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const wrapperStyle: CSSProperties = {
  margin: '12px 0 16px',
  fontSize: 13,
  color: 'var(--mn-text-3)',
};

const listStyle: CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  alignItems: 'center',
};

const linkStyle: CSSProperties = {
  color: 'var(--mn-text-2)',
  textDecoration: 'none',
};

const currentStyle: CSSProperties = {
  color: 'var(--mn-text-1)',
  fontWeight: 600,
};

const separatorStyle: CSSProperties = {
  color: 'var(--mn-text-4)',
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Janitor JAN38-R5 — filtre les labels vides : sinon le span/Link
  // produit un trou visuel + un `aria-current="page"` vide (lu par les
  // SR comme un node sans nom).
  const visibleItems = items.filter((item) => item.label.trim().length > 0);
  if (visibleItems.length === 0) return null;
  return (
    <nav aria-label="Fil d'Ariane" style={wrapperStyle}>
      <ol style={listStyle}>
        {visibleItems.map((item, idx) => {
          const isLast = idx === visibleItems.length - 1;
          return (
            <Fragment key={`${item.label}-${idx}`}>
              <li>
                {item.to && !isLast ? (
                  <Link to={item.to} style={linkStyle}>
                    {item.label}
                  </Link>
                ) : (
                  <span style={currentStyle} aria-current={isLast ? 'page' : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li aria-hidden="true" style={separatorStyle}>
                  ›
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
