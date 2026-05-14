import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import AboutPage from './AboutPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <AboutPage />
    </MemoryRouter>,
  );
}

describe('AboutPage', () => {
  it('affiche le H1 « À propos de Maintenant ! »', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: /À propos de Maintenant/i }),
    ).toBeInTheDocument();
  });

  it('rend les 3 sections (Équipe / Valeurs / Historique)', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 2, name: /L.+équipe/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Nos valeurs/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Historique/i })).toBeInTheDocument();
  });

  it('marque chaque membre d’équipe avec un badge démo (RGPD / loyauté)', () => {
    renderPage();
    const badges = screen.getAllByTestId('about-team-demo-badge');
    expect(badges.length).toBeGreaterThanOrEqual(3);
    badges.forEach((badge) => {
      expect(badge).toHaveTextContent(/Bio démo/i);
    });
  });

  it('expose au moins 5 valeurs', () => {
    renderPage();
    const valueTitles = [
      /Citoyen·nes d.+abord/i,
      /Transparence radicale/i,
      /Sobriété & éthique/i,
      /Action concrète/i,
      /Inclusion sans condition/i,
    ];
    valueTitles.forEach((re) => {
      expect(screen.getByText(re)).toBeInTheDocument();
    });
  });

  it('le CTA final pointe vers /decouvrir', () => {
    renderPage();
    const cta = screen.getByRole('link', { name: /Découvrir le mouvement/i });
    expect(cta).toHaveAttribute('href', '/decouvrir');
  });
});
