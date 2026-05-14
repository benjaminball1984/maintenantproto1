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
  it('affiche le H1 « À propos du mouvement Maintenant ! »', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: /À propos du mouvement Maintenant/i }),
    ).toBeInTheDocument();
  });

  it('rend les 3 sections (Équipe / Valeurs / Dates clés)', () => {
    renderPage();
    expect(screen.getByTestId('about-team')).toBeInTheDocument();
    expect(screen.getByTestId('about-values')).toBeInTheDocument();
    expect(screen.getByTestId('about-history')).toBeInTheDocument();
  });

  it('rend au moins 3 membres de l’équipe avec un badge « démo »', () => {
    renderPage();
    const demoBadges = screen.getAllByTestId('about-team-demo-badge');
    expect(demoBadges.length).toBeGreaterThanOrEqual(3);
    demoBadges.forEach((badge) => {
      expect(badge).toHaveTextContent(/démo/i);
    });
  });

  it('rend les 5 valeurs (indépendance, transparence, horizontalité, utilité, privacy)', () => {
    renderPage();
    expect(screen.getByTestId('about-value-independence')).toBeInTheDocument();
    expect(screen.getByTestId('about-value-transparency')).toBeInTheDocument();
    expect(screen.getByTestId('about-value-horizontality')).toBeInTheDocument();
    expect(screen.getByTestId('about-value-utility')).toBeInTheDocument();
    expect(screen.getByTestId('about-value-privacy')).toBeInTheDocument();
  });

  it('rend au moins 3 dates clés dans la section historique', () => {
    renderPage();
    const history = screen.getByTestId('about-history');
    const items = history.querySelectorAll('ul > li');
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it('expose des liens internes vers /roadmap et /legal/contact', () => {
    renderPage();
    const links = screen.getAllByRole('link');
    const hrefs = links.map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/roadmap');
    expect(hrefs).toContain('/legal/contact');
  });
});
