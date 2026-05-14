import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Breadcrumbs from './Breadcrumbs';

function renderWithRouter(items: { label: string; to?: string }[]) {
  return render(
    <MemoryRouter>
      <Breadcrumbs items={items} />
    </MemoryRouter>,
  );
}

describe('Breadcrumbs', () => {
  it('rend un <nav aria-label="Fil d\'Ariane"> avec une <ol> ordonnée', () => {
    renderWithRouter([
      { label: 'Accueil', to: '/' },
      { label: 'Pétitions', to: '/petitions' },
      { label: 'Ma pétition' },
    ]);
    expect(screen.getByRole('navigation', { name: /Fil d'Ariane/i })).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('rend les items intermédiaires en <Link> et le dernier en span avec aria-current="page"', () => {
    renderWithRouter([
      { label: 'Accueil', to: '/' },
      { label: 'Pétitions', to: '/petitions' },
      { label: 'Ma pétition' },
    ]);
    // 2 liens (Accueil, Pétitions), pas de lien pour « Ma pétition ».
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/');
    expect(links[1]).toHaveAttribute('href', '/petitions');
    // Le dernier item porte aria-current="page".
    const current = screen.getByText('Ma pétition');
    expect(current).toHaveAttribute('aria-current', 'page');
  });

  it('rend les séparateurs en aria-hidden="true" (non lus par les SR)', () => {
    const { container } = renderWithRouter([
      { label: 'A', to: '/a' },
      { label: 'B', to: '/b' },
      { label: 'C' },
    ]);
    const separators = container.querySelectorAll('[aria-hidden="true"]');
    expect(separators.length).toBe(2); // 2 séparateurs pour 3 items.
  });

  it('ne rend rien si items est vide', () => {
    const { container } = renderWithRouter([]);
    expect(container.firstChild).toBeNull();
  });

  it('rend un seul item comme page courante sans lien', () => {
    renderWithRouter([{ label: 'Seul item' }]);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.getByText('Seul item')).toHaveAttribute('aria-current', 'page');
  });
});
