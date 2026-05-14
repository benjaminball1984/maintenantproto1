import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import FaqPage from './FaqPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <FaqPage />
    </MemoryRouter>,
  );
}

describe('FaqPage', () => {
  it('affiche le H1 « Questions fréquentes »', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: /Questions fréquentes/i }),
    ).toBeInTheDocument();
  });

  it('rend les 5 catégories (Compte / RGPD / T99CP / Stripe / Modération)', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 2, name: /Compte & connexion/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Données personnelles/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /T99CP/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Paiements & Stripe/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Modération/i }),
    ).toBeInTheDocument();
  });

  it('contient au moins 15 entrées Q/R via <details>', () => {
    renderPage();
    const entries = screen.getAllByTestId('faq-entry');
    expect(entries.length).toBeGreaterThanOrEqual(15);
    entries.forEach((entry) => {
      expect(entry.tagName.toLowerCase()).toBe('details');
    });
  });

  it('chaque <details> est replié par défaut (pas d’attribut open)', () => {
    renderPage();
    const entries = screen.getAllByTestId('faq-entry');
    entries.forEach((entry) => {
      expect(entry).not.toHaveAttribute('open');
    });
  });

  it('le CTA pointe vers /legal/contact', () => {
    renderPage();
    const ctaLinks = screen.getAllByRole('link', { name: /Nous contacter|Contacte-nous/i });
    expect(ctaLinks.length).toBeGreaterThan(0);
    ctaLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', '/legal/contact');
    });
  });
});
