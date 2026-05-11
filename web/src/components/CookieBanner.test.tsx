import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import CookieBanner from './CookieBanner';
import { CONSENT_STORAGE_KEY, CONSENT_VERSION, readConsent, writeConsent } from '@/lib/consent';

beforeEach(() => {
  window.localStorage.clear();
});

function renderBanner() {
  return render(
    <MemoryRouter>
      <CookieBanner />
    </MemoryRouter>,
  );
}

describe('CookieBanner — affichage', () => {
  it('s’affiche quand aucun consentement n’est enregistré', () => {
    renderBanner();
    expect(screen.getByRole('region', { name: /Cookies et confidentialité/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tout accepter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tout refuser/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Personnaliser/i })).toBeInTheDocument();
  });

  it('ne s’affiche pas quand un consentement valide existe déjà', () => {
    writeConsent('essential', { analytics: false });
    renderBanner();
    expect(screen.queryByRole('region', { name: /Cookies/i })).not.toBeInTheDocument();
  });

  it('réapparaît si le consentement stocké a une version obsolète', () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: CONSENT_VERSION - 1,
        choice: 'all',
        categories: { analytics: true },
        at: new Date().toISOString(),
      }),
    );
    renderBanner();
    expect(screen.getByRole('region', { name: /Cookies et confidentialité/i })).toBeInTheDocument();
  });
});

describe('CookieBanner — actions', () => {
  it('« Tout accepter » persiste analytics=true et ferme la bannière', async () => {
    const user = userEvent.setup();
    renderBanner();
    await user.click(screen.getByRole('button', { name: /Tout accepter/i }));
    const record = readConsent();
    expect(record?.choice).toBe('all');
    expect(record?.categories.analytics).toBe(true);
    expect(screen.queryByRole('region', { name: /Cookies/i })).not.toBeInTheDocument();
  });

  it('« Tout refuser » persiste analytics=false et ferme la bannière', async () => {
    const user = userEvent.setup();
    renderBanner();
    await user.click(screen.getByRole('button', { name: /Tout refuser/i }));
    const record = readConsent();
    expect(record?.choice).toBe('essential');
    expect(record?.categories.analytics).toBe(false);
    expect(screen.queryByRole('region', { name: /Cookies/i })).not.toBeInTheDocument();
  });

  it('« Personnaliser » ouvre un panneau avec les catégories', async () => {
    const user = userEvent.setup();
    renderBanner();
    const customizeBtn = screen.getByRole('button', { name: /Personnaliser/i });
    expect(customizeBtn).toHaveAttribute('aria-expanded', 'false');
    await user.click(customizeBtn);
    expect(customizeBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText(/Strictement nécessaires/i)).toBeDisabled();
    expect(screen.getByLabelText(/Mesure d'audience anonymisée/i)).not.toBeChecked();
    expect(screen.getByRole('button', { name: /Enregistrer mes choix/i })).toBeInTheDocument();
  });

  it('toggle analytics + enregistrement persiste un choix custom', async () => {
    const user = userEvent.setup();
    renderBanner();
    await user.click(screen.getByRole('button', { name: /Personnaliser/i }));
    await user.click(screen.getByLabelText(/Mesure d'audience anonymisée/i));
    await user.click(screen.getByRole('button', { name: /Enregistrer mes choix/i }));
    const record = readConsent();
    expect(record?.choice).toBe('custom');
    expect(record?.categories.analytics).toBe(true);
    expect(screen.queryByRole('region', { name: /Cookies/i })).not.toBeInTheDocument();
  });
});
