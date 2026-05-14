import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import EmptyState from './EmptyState';
import { IconPen } from './icons';

function renderEmpty(props: Partial<React.ComponentProps<typeof EmptyState>> = {}) {
  return render(
    <MemoryRouter>
      <EmptyState
        icon={<IconPen />}
        title="Aucune pétition pour le moment"
        description="Lance la première sur ce sujet."
        {...props}
      />
    </MemoryRouter>,
  );
}

describe('EmptyState', () => {
  it('rend le titre et la description', () => {
    renderEmpty();
    expect(screen.getByText('Aucune pétition pour le moment')).toBeInTheDocument();
    expect(screen.getByText('Lance la première sur ce sujet.')).toBeInTheDocument();
  });

  it("rend un wrapper avec role='note'", () => {
    renderEmpty();
    expect(screen.getByRole('note')).toBeInTheDocument();
  });

  it("n'affiche pas de CTA quand `cta` est absent", () => {
    renderEmpty();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('affiche le CTA et le lie vers `cta.to`', () => {
    renderEmpty({ cta: { to: '/petitions/new', label: 'Créer la première' } });
    const link = screen.getByRole('link', { name: /Créer la première/i });
    expect(link).toHaveAttribute('href', '/petitions/new');
  });

  it('propage `testId` sur le wrapper', () => {
    renderEmpty({ testId: 'petitions-empty' });
    expect(screen.getByTestId('petitions-empty')).toBeInTheDocument();
  });

  it("n'expose pas l'icône à l'API a11y (wrapper aria-hidden)", () => {
    renderEmpty();
    // Le wrapper de l'icône a `aria-hidden`. Le SVG IconPen lui-même a
    // `aria-hidden="true"` dans icons.tsx, donc en pratique il n'y a
    // aucun élément accessible au screen reader pour l'icône.
    const svg = document.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });
});
