import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ServicesHubPage from './ServicesHubPage';

function renderHub() {
  return render(
    <MemoryRouter initialEntries={['/services']}>
      <ServicesHubPage />
    </MemoryRouter>,
  );
}

describe('ServicesHubPage', () => {
  it('rend le hero avec le titre principal', () => {
    renderHub();
    expect(
      screen.getByRole('heading', { name: /Services solidaires/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it('rend les 7 cards de services', () => {
    renderHub();
    const list = screen.getByRole('list', { name: /Liste des services solidaires/i });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(7);
  });

  it('rend un lien vers chaque service', () => {
    renderHub();
    const expectedSlugs = [
      'housing',
      'carpooling',
      'marketplace',
      'lending',
      'garden',
      'sel',
      'crowdfunding',
    ];
    for (const slug of expectedSlugs) {
      const card = screen.getByTestId(`service-card-${slug}`);
      expect(card).toHaveAttribute('href', `/services/${slug}`);
    }
  });

  it('affiche la section RGPD / confiance', () => {
    renderHub();
    expect(
      screen.getByRole('heading', { name: /Confiance & RGPD/i, level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Aucune commission, aucune publicité/i)).toBeInTheDocument();
  });

  it('applique la classe mn-listing-card pour le hover', () => {
    renderHub();
    const card = screen.getByTestId('service-card-housing');
    expect(card).toHaveClass('mn-listing-card');
  });
});
