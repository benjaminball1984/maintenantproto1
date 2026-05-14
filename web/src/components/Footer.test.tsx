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

  it("affiche l'année courante", () => {
    renderFooter();
    const year = String(new Date().getFullYear());
    expect(screen.getByText(new RegExp(`Maintenant\\s*!.*${year}`))).toBeInTheDocument();
  });

  it('expose les trois colonnes Mission / Outils / Légal', () => {
    renderFooter();
    expect(screen.getByRole('heading', { level: 2, name: /Mission/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Outils/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /^Légal$/i })).toBeInTheDocument();
  });

  it('expose les liens outils principaux', () => {
    renderFooter();
    const toolsHeading = screen.getByRole('heading', { level: 2, name: /Outils/i });
    const toolsNav = toolsHeading.closest('nav');
    expect(toolsNav).not.toBeNull();
    if (!toolsNav) return;
    const navEl = toolsNav as HTMLElement;
    expect(within(navEl).getByRole('link', { name: /Pétitions/i })).toHaveAttribute(
      'href',
      '/petitions',
    );
    expect(within(navEl).getByRole('link', { name: /Mobilisations/i })).toHaveAttribute(
      'href',
      '/mobilizations',
    );
    expect(within(navEl).getByRole('link', { name: /Services entraide/i })).toHaveAttribute(
      'href',
      '/services',
    );
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

  it('expose un CTA Rejoindre depuis la colonne Mission', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: /Rejoindre le mouvement/i })).toHaveAttribute(
      'href',
      '/join',
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
