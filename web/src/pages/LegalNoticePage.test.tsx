import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import LegalNoticePage from './LegalNoticePage';

function renderPage() {
  return render(
    <MemoryRouter>
      <LegalNoticePage />
    </MemoryRouter>,
  );
}

describe('LegalNoticePage', () => {
  it('affiche le titre principal', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: /Mentions légales/i }),
    ).toBeInTheDocument();
  });

  it('mentionne éditeur et hébergeurs', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /Éditeur/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Hébergement/i })).toBeInTheDocument();
    expect(screen.getByText(/Netlify/)).toBeInTheDocument();
    expect(screen.getByText(/Supabase/)).toBeInTheDocument();
  });

  // Étape 43 — audit beta-testeur F1 : les 4 champs « À compléter avant
  // mise en production » doivent avoir disparu, remplacés par les vraies
  // données de l'association.
  it('ne contient plus aucun placeholder « À compléter » (F1)', () => {
    renderPage();
    expect(screen.queryByText(/À compléter avant mise en production/i)).not.toBeInTheDocument();
  });

  it('affiche le siège social, le contact officiel et le statut SIRET', () => {
    renderPage();
    expect(screen.getByText(/27 rue de Paradis/i)).toBeInTheDocument();
    expect(screen.getByText(/95100 Argenteuil/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact@maintenant\.org/i })).toBeInTheDocument();
    expect(screen.getByText(/En cours d.attribution/i)).toBeInTheDocument();
  });
});
