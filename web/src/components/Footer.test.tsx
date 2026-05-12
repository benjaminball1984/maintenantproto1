import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Footer from './Footer';

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );
}

describe('Footer', () => {
  it('rend la section footer avec le label aria « Pied de page »', () => {
    renderFooter();
    expect(screen.getByRole('contentinfo', { name: /Pied de page/i })).toBeInTheDocument();
  });

  it('affiche l’année courante', () => {
    renderFooter();
    const year = String(new Date().getFullYear());
    expect(screen.getByText(new RegExp(`Maintenant\\s*!.*${year}`))).toBeInTheDocument();
  });

  it('expose les liens légaux + transparence requis', () => {
    renderFooter();
    const legalNav = screen.getByRole('navigation', { name: /Liens légaux/i });
    expect(within(legalNav).getByRole('link', { name: /Confidentialité/i })).toHaveAttribute(
      'href',
      '/legal/privacy',
    );
    expect(within(legalNav).getByRole('link', { name: /Mentions légales/i })).toHaveAttribute(
      'href',
      '/legal/notice',
    );
    expect(within(legalNav).getByRole('link', { name: /Cookies/i })).toHaveAttribute(
      'href',
      '/legal/cookies',
    );
    expect(within(legalNav).getByRole('link', { name: /Contact/i })).toHaveAttribute(
      'href',
      '/legal/contact',
    );
    expect(within(legalNav).getByRole('link', { name: /Transparence/i })).toHaveAttribute(
      'href',
      '/transparence',
    );
  });

  it('ne contient pas de tracking externe (lien externe vers analytics)', () => {
    renderFooter();
    const links = screen.getAllByRole('link');
    for (const link of links) {
      const href = link.getAttribute('href') ?? '';
      // Tous les liens du footer sont internes (chemins relatifs commençant par /).
      // Aucun lien externe vers un service de tracking / analytics.
      expect(href.startsWith('/')).toBe(true);
      expect(href.startsWith('//')).toBe(false);
      expect(/^https?:\/\//.test(href)).toBe(false);
    }
  });
});
