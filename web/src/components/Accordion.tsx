import type { CSSProperties, ReactNode } from 'react';

export interface AccordionItem {
  /** Identifiant unique stable (utilisé pour la `key` React + ancrage data-testid). */
  id: string;
  /** Question / résumé visible toujours. */
  question: ReactNode;
  /** Réponse / contenu détaillé révélé à l'ouverture. */
  answer: ReactNode;
}

export interface AccordionProps {
  /** Liste d'items (question + réponse). */
  items: AccordionItem[];
  /** Étiquette d'accessibilité du conteneur. */
  ariaLabel?: string;
  /** Test id propagé pour identifier le groupe. */
  testId?: string;
}

const groupStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
};

const itemStyle: CSSProperties = {
  border: '1px solid var(--mn-border)',
  borderRadius: 12,
  background: 'var(--mn-surface)',
  overflow: 'hidden',
};

const summaryStyle: CSSProperties = {
  listStyle: 'none',
  cursor: 'pointer',
  padding: '0.95rem 1.1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  fontFamily: "'Sora', sans-serif",
  fontSize: 15,
  fontWeight: 600,
  color: 'var(--mn-text-1)',
};

const chevronStyle: CSSProperties = {
  flex: 'none',
  width: 16,
  height: 16,
  color: 'var(--mn-text-3)',
};

const answerStyle: CSSProperties = {
  padding: '0 1.1rem 1rem',
  color: 'var(--mn-text-2)',
  fontSize: 14,
  lineHeight: 1.6,
};

/**
 * Accordion réutilisable basé sur `<details>` natif — clavier + a11y
 * gérés gratuitement par le navigateur. Le style custom apporte le
 * chevron qui tourne à l'ouverture. La transition height ≤ 200ms est
 * définie dans `index.css` (sélecteur global `details.mn-accordion-item`)
 * et désactivée via `prefers-reduced-motion: reduce`.
 */
export default function Accordion({ items, ariaLabel, testId }: AccordionProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel ?? undefined}
      style={groupStyle}
      data-testid={testId}
    >
      {items.map((item) => (
        <details
          key={item.id}
          className="mn-accordion-item"
          style={itemStyle}
          data-testid={`accordion-item-${item.id}`}
        >
          <summary style={summaryStyle} data-testid={`accordion-summary-${item.id}`}>
            <span>{item.question}</span>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mn-accordion-chevron"
              style={chevronStyle}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </summary>
          <div style={answerStyle}>{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
