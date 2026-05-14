import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  it('affiche le H1 « Foire aux questions »', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: /Foire aux questions/i }),
    ).toBeInTheDocument();
  });

  it('expose les 5 catégories (Compte / RGPD / T99CP / Stripe / Modération)', () => {
    renderPage();
    expect(screen.getByTestId('faq-category-account')).toBeInTheDocument();
    expect(screen.getByTestId('faq-category-rgpd')).toBeInTheDocument();
    expect(screen.getByTestId('faq-category-t99cp')).toBeInTheDocument();
    expect(screen.getByTestId('faq-category-stripe')).toBeInTheDocument();
    expect(screen.getByTestId('faq-category-moderation')).toBeInTheDocument();
  });

  it('rend au moins 15 questions dans l’accordion (réelles ≥ 15)', () => {
    renderPage();
    const details = document.querySelectorAll('details.mn-accordion-item');
    expect(details.length).toBeGreaterThanOrEqual(15);
  });

  it('ouvre une question au clic sur son <summary>', async () => {
    const user = userEvent.setup();
    renderPage();
    const summary = screen.getByTestId('accordion-summary-account-signup');
    const details = screen.getByTestId('accordion-item-account-signup');
    expect(details.hasAttribute('open')).toBe(false);
    await user.click(summary);
    expect(details.hasAttribute('open')).toBe(true);
  });

  it('rend chaque <summary> avec un libellé textuel non vide (a11y)', () => {
    renderPage();
    const summaries = document.querySelectorAll('summary');
    expect(summaries.length).toBeGreaterThan(0);
    summaries.forEach((s) => {
      expect((s.textContent ?? '').trim().length).toBeGreaterThan(0);
    });
  });

  it('expose au moins un lien vers la page Contact (fallback utilisateur)', () => {
    renderPage();
    const contactLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href') === '/legal/contact');
    expect(contactLinks.length).toBeGreaterThanOrEqual(1);
  });
});
