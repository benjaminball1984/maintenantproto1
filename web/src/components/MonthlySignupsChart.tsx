import type { CSSProperties } from 'react';

import { formatMonthShortFr, type MonthlySignupBucket } from '@/lib/transparency';

// =====================================================================================
// Bar chart inline (SVG natif) pour les inscriptions par mois.
//
// Conçu pour la page `/transparence` — petit volume de données (12 mois max),
// échelle stable, pas de dépendance externe (recharts, victory, etc.) pour
// préserver le bundle. Accessibilité : role="img" + aria-label résume la
// série. Les barres ne portent pas d'aria-label individuel (redondant) ; les
// labels sous l'axe X servent à la lecture visuelle.
// =====================================================================================

interface Props {
  buckets: MonthlySignupBucket[];
  /** Titre lisible pour les lecteurs d'écran (`aria-label` racine). */
  ariaLabel?: string;
  /**
   * Hauteur minimale (px) du conteneur SVG. Le viewBox conserve son ratio,
   * mais le wrapper réserve la hauteur visuelle souhaitée — étape 37 :
   * /transparence agrandit à 360 px (responsive width: 100% inchangé).
   */
  minHeight?: number;
}

const baseWrapperStyle: CSSProperties = {
  background: 'var(--mn-surface-2)',
  border: '1px solid var(--mn-border)',
  borderRadius: 12,
  padding: '1.25rem',
  margin: '1rem 0 0',
};

const emptyStyle: CSSProperties = {
  color: 'var(--mn-text-2)',
  fontSize: 14,
  margin: 0,
};

const baseSvgStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
};

const VIEWBOX_WIDTH = 600;
const VIEWBOX_HEIGHT = 220;
const PADDING_LEFT = 32;
const PADDING_RIGHT = 8;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 32;

export default function MonthlySignupsChart({
  buckets,
  ariaLabel = 'Inscriptions par mois sur les 12 derniers mois',
  minHeight,
}: Props) {
  const wrapperStyle: CSSProperties = minHeight
    ? { ...baseWrapperStyle, minHeight }
    : baseWrapperStyle;
  // `width: 100%` est préservé. `height: auto` reste valable, mais on impose
  // une hauteur minimale au SVG quand le wrapper en a une — sinon le SVG
  // collapserait au ratio viewBox dans Safari.
  const svgStyle: CSSProperties = minHeight
    ? { ...baseSvgStyle, minHeight: Math.max(minHeight - 40, 0) }
    : baseSvgStyle;

  const total = buckets.reduce((s, b) => s + b.count, 0);
  if (total === 0) {
    return (
      <div style={wrapperStyle} role="status">
        <p style={emptyStyle}>
          Aucune inscription enregistrée sur la période. Le graphique
          apparaîtra dès la première inscription publique.
        </p>
      </div>
    );
  }

  const max = Math.max(...buckets.map((b) => b.count));
  const innerWidth = VIEWBOX_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const innerHeight = VIEWBOX_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const barWidth = innerWidth / buckets.length;
  const yScale = (count: number) => (count / max) * innerHeight;

  return (
    <div style={wrapperStyle} data-testid="monthly-signups-chart">
      <svg
        style={svgStyle}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        role="img"
        aria-label={ariaLabel}
        preserveAspectRatio="xMidYMid meet"
      >
        <title>{ariaLabel}</title>
        {/* Axe horizontal */}
        <line
          x1={PADDING_LEFT}
          x2={VIEWBOX_WIDTH - PADDING_RIGHT}
          y1={VIEWBOX_HEIGHT - PADDING_BOTTOM}
          y2={VIEWBOX_HEIGHT - PADDING_BOTTOM}
          stroke="var(--mn-border)"
          strokeWidth={1}
        />
        {/* Tick max sur l'axe Y */}
        <text
          x={PADDING_LEFT - 6}
          y={PADDING_TOP + 4}
          fontSize={11}
          textAnchor="end"
          fill="var(--mn-text-2)"
        >
          {max}
        </text>
        {/* Tick 0 sur l'axe Y */}
        <text
          x={PADDING_LEFT - 6}
          y={VIEWBOX_HEIGHT - PADDING_BOTTOM + 4}
          fontSize={11}
          textAnchor="end"
          fill="var(--mn-text-2)"
        >
          0
        </text>
        {buckets.map((bucket, idx) => {
          const barH = yScale(bucket.count);
          const x = PADDING_LEFT + idx * barWidth + barWidth * 0.15;
          const w = barWidth * 0.7;
          const y = VIEWBOX_HEIGHT - PADDING_BOTTOM - barH;
          const labelX = PADDING_LEFT + idx * barWidth + barWidth / 2;
          return (
            <g key={bucket.monthIso}>
              <rect
                x={x}
                y={y}
                width={w}
                height={barH}
                fill="var(--mn-brand)"
                rx={2}
              />
              <text
                x={labelX}
                y={VIEWBOX_HEIGHT - PADDING_BOTTOM + 14}
                fontSize={11}
                textAnchor="middle"
                fill="var(--mn-text-2)"
              >
                {formatMonthShortFr(bucket.monthIso)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
