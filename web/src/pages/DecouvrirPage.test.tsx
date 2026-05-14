import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import DecouvrirPage from './DecouvrirPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <DecouvrirPage />
    </MemoryRouter>,
  );
}

describe('DecouvrirPage', () => {
  it('affiche le H1 « Découvre le mouvement Maintenant ! »', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: /Découvre le mouvement/i }),
    ).toBeInTheDocument();
  });

  it('rend les 5 sections éditoriales (Mission / Comment / Outils / Vision / Roadmap)', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 2, name: /Notre mission/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Comment ça marche/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Les outils/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Notre vision/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Roadmap/i })).toBeInTheDocument();
  });

  it('rend les 6 liens vers les outils', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /Pétitions/i })).toHaveAttribute('href', '/petitions');
    expect(screen.getByRole('link', { name: /Mobilisations/i })).toHaveAttribute(
      'href',
      '/mobilizations',
    );
    expect(screen.getByRole('link', { name: /Sondages citoyens/i })).toHaveAttribute(
      'href',
      '/polls',
    );
    expect(screen.getByRole('link', { name: /Campagnes/i })).toHaveAttribute('href', '/campaigns');
    expect(screen.getByRole('link', { name: /Services d/i })).toHaveAttribute('href', '/services');
    expect(screen.getByRole('link', { name: /Communes libres/i })).toHaveAttribute(
      'href',
      '/communes',
    );
  });

  it('marque explicitement les 3 témoignages comme démo (RGPD / loyauté)', () => {
    renderPage();
    const badges = screen.getAllByTestId('decouvrir-demo-badge');
    expect(badges).toHaveLength(3);
    badges.forEach((badge) => {
      expect(badge).toHaveTextContent(/Témoignage démo/i);
    });
    expect(
      screen.getAllByText(/Témoignage fictif — démo \(remplacé à T\+3 mois\)/i),
    ).toHaveLength(3);
  });

  it('expose le CTA final « Rejoindre le mouvement » vers /join', () => {
    renderPage();
    expect(
      screen.getByRole('link', { name: /Rejoindre le mouvement Maintenant/i }),
    ).toHaveAttribute('href', '/join');
  });

  it('lien Transparence présent dans la section mission', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /page Transparence/i })).toHaveAttribute(
      'href',
      '/transparence',
    );
  });
});
