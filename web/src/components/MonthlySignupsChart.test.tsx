import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import MonthlySignupsChart from './MonthlySignupsChart';
import { buildMonthsRange } from '@/lib/transparency';

describe('MonthlySignupsChart', () => {
  const REF = new Date(Date.UTC(2026, 4, 12));

  it('affiche un message vide quand tous les compteurs sont à zéro', () => {
    const buckets = buildMonthsRange(REF, 12);
    render(<MonthlySignupsChart buckets={buckets} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/Aucune inscription/i);
  });

  it('rend un SVG avec role=img et aria-label par défaut quand des données existent', () => {
    const buckets = buildMonthsRange(REF, 12);
    const target = buckets[buckets.length - 1];
    if (target) target.count = 42;
    render(<MonthlySignupsChart buckets={buckets} />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute(
      'aria-label',
      'Inscriptions par mois sur les 12 derniers mois',
    );
    // tick max sur l'axe Y (le plus grand bucket)
    expect(svg).toHaveTextContent('42');
    // label « mai 26 » pour le dernier bucket (2026-05-01)
    expect(svg).toHaveTextContent('mai 26');
  });

  it('respecte un aria-label custom', () => {
    const buckets = buildMonthsRange(REF, 3);
    const first = buckets[0];
    if (first) first.count = 7;
    render(
      <MonthlySignupsChart
        buckets={buckets}
        ariaLabel="Inscriptions sur 3 mois — test"
      />,
    );
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      'Inscriptions sur 3 mois — test',
    );
  });

  it('rend une <rect> par bucket avec count > 0', () => {
    const buckets = buildMonthsRange(REF, 4);
    const first = buckets[0];
    const last = buckets[3];
    if (first) first.count = 5;
    if (last) last.count = 10;
    const { container } = render(<MonthlySignupsChart buckets={buckets} />);
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBe(4); // une rect par bucket (incluant ceux à 0, hauteur 0)
  });
});
