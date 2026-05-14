import type { CSSProperties } from 'react';

export interface SkeletonProps {
  /** Largeur (CSS value : '100%', 120, '14rem'). Défaut : '100%'. */
  width?: number | string;
  /** Hauteur (CSS value). Défaut : 16. */
  height?: number | string;
  /** Border radius (number = px). Défaut : 8. */
  radius?: number | string;
  /** `aria-label` lu par les screen readers pendant le chargement. */
  label?: string;
  /** Test-id propagé pour identifier l'instance. */
  testId?: string;
  /** Style additionnel (margin, etc.). */
  style?: CSSProperties;
}

/**
 * Bloc de skeleton réutilisable — pulse animé via `.mn-skeleton`
 * (cf. `index.css`). Animation désactivée si `prefers-reduced-motion`.
 *
 * Bonne pratique : exposer `aria-label` côté wrapper, pas sur chaque
 * bloc, pour éviter le bruit aux screen readers. Utiliser plutôt
 * `<SkeletonCard>` ou regrouper plusieurs `<Skeleton>` dans un
 * conteneur `role="status" aria-live="polite"` avec un seul label.
 */
export default function Skeleton({
  width = '100%',
  height = 16,
  radius = 8,
  label,
  testId,
  style,
}: SkeletonProps) {
  return (
    <span
      className="mn-skeleton"
      aria-label={label}
      data-testid={testId}
      style={{
        display: 'inline-block',
        width,
        height,
        borderRadius: typeof radius === 'number' ? `${radius}px` : radius,
        ...style,
      }}
    />
  );
}

const cardWrapStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: '16px 18px',
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 14,
};

const cardGridStyle: CSSProperties = {
  display: 'grid',
  gap: 14,
  margin: '14px 0 0',
};

export interface SkeletonCardListProps {
  /** Nombre de cards skeleton à rendre. Défaut : 3. */
  count?: number;
  /** Label aria-live pour le wrapper (lu une seule fois). */
  label?: string;
  /** Test-id propagé pour identifier l'instance. */
  testId?: string;
}

/**
 * Liste de skeleton cards pour les pages listing (pétitions,
 * mobilisations, sondages, campagnes…). Remplace l'ancien
 * `<p>Chargement…</p>`. Un seul `role="status"` au wrapper, label
 * unique pour les screen readers.
 */
export function SkeletonCardList({
  count = 3,
  label = 'Chargement…',
  testId,
}: SkeletonCardListProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      data-testid={testId}
      style={cardGridStyle}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={cardWrapStyle} data-testid="skeleton-card">
          <Skeleton width="60%" height={18} />
          <Skeleton width="100%" height={12} />
          <Skeleton width="85%" height={12} />
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <Skeleton width={80} height={22} radius={999} />
            <Skeleton width={60} height={22} radius={999} />
          </div>
        </div>
      ))}
    </div>
  );
}
