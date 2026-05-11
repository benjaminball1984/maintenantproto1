import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import CookiesPage from './CookiesPage';
import { readConsent, writeConsent } from '@/lib/consent';

beforeEach(() => {
  window.localStorage.clear();
});

function renderPage() {
  return render(
    <MemoryRouter>
      <CookiesPage />
    </MemoryRouter>,
  );
}

describe('CookiesPage', () => {
  it('affiche le titre + tableau des cookies', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: /Cookies/i })).toBeInTheDocument();
    expect(screen.getByText(/sb-auth-token/i)).toBeInTheDocument();
    expect(screen.getByText(/mn:cookie-consent/i)).toBeInTheDocument();
    expect(screen.getByText(/_mn_audience/i)).toBeInTheDocument();
  });

  it('indique « aucun choix » quand rien n’est stocké', () => {
    renderPage();
    expect(screen.getByText(/Aucun choix enregistré/i)).toBeInTheDocument();
  });

  it('reflète un choix « tout accepter » déjà enregistré', () => {
    writeConsent('all', { analytics: true });
    renderPage();
    expect(screen.getByText(/tous les cookies/i)).toBeInTheDocument();
  });

  it('bouton « Modifier mes choix » purge le consentement', async () => {
    const user = userEvent.setup();
    writeConsent('essential', { analytics: false });
    renderPage();
    expect(screen.getByText(/refusé la mesure d’audience/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Modifier mes choix/i }));
    expect(readConsent()).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent(/réinitialisé/i);
  });
});
