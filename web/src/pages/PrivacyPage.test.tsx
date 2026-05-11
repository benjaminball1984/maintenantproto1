import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import PrivacyPage from './PrivacyPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <PrivacyPage />
    </MemoryRouter>,
  );
}

describe('PrivacyPage', () => {
  it('affiche le titre principal', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: /Politique de confidentialité/i }),
    ).toBeInTheDocument();
  });

  it('expose toutes les ancres de sommaire requises', () => {
    renderPage();
    const ids = [
      'responsable',
      'finalites',
      'base-legale',
      'donnees',
      'conservation',
      'sous-traitants',
      'droits',
      'dpo',
    ];
    for (const id of ids) {
      // L'ancre est portée par <section id="..."> côté DOM.
      const section = document.getElementById(id);
      expect(section, `section #${id}`).not.toBeNull();
    }
  });

  it('liste les sous-traitants Supabase / Vercel / Stripe / Sentry', () => {
    renderPage();
    expect(screen.getByText(/Supabase/)).toBeInTheDocument();
    expect(screen.getByText(/Vercel/)).toBeInTheDocument();
    expect(screen.getAllByText(/Stripe/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Sentry/)).toBeInTheDocument();
  });
});
