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
  it('affiche l’eyebrow « Le projet en quelques mots » (D-017)', () => {
    renderPage();
    expect(screen.getByText(/Le projet en quelques mots/i)).toBeInTheDocument();
  });

  it('affiche le H1 « À propos de Maintenant ! » (D-018 conservé)', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: /À propos de Maintenant/i }),
    ).toBeInTheDocument();
  });

  it('ne rend plus les sections Équipe (D-020) ni Valeurs (D-021)', () => {
    renderPage();
    expect(screen.queryByRole('heading', { level: 2, name: /L.+équipe/i })).toBeNull();
    expect(screen.queryByRole('heading', { level: 2, name: /Nos valeurs/i })).toBeNull();
  });

  it('garde la section Historique', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 2, name: /Historique/i })).toBeInTheDocument();
  });

  it('le CTA final pointe vers /join (D-T01 — /decouvrir supprimé)', () => {
    renderPage();
    const cta = screen.getByRole('link', { name: /Rejoindre le mouvement/i });
    expect(cta).toHaveAttribute('href', '/join');
  });

  it('mentionne l’adhésion « à prix libre à partir de 0 € » (D-023)', () => {
    renderPage();
    expect(
      screen.getByText(/à prix libre à partir de 0\s*€/i),
    ).toBeInTheDocument();
  });
});
