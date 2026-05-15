import { describe, it, expect, beforeEach } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import OnboardingModal from './OnboardingModal';
import { hasSeenOnboarding, markOnboardingSeen } from '@/lib/onboarding';
import { writeConsent } from '@/lib/consent';

function renderModal(props: Parameters<typeof OnboardingModal>[0] = {}) {
  return render(
    <MemoryRouter>
      <OnboardingModal {...props} />
    </MemoryRouter>,
  );
}

describe('OnboardingModal — flag localStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('hasSeenOnboarding() retourne false par défaut', () => {
    expect(hasSeenOnboarding()).toBe(false);
  });

  it('markOnboardingSeen() pose le flag à "1"', () => {
    markOnboardingSeen();
    expect(window.localStorage.getItem('mn-onboarding-seen')).toBe('1');
    expect(hasSeenOnboarding()).toBe(true);
  });
});

describe('OnboardingModal — rendu', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('s’affiche par défaut si flag absent ET consentement cookies déjà choisi', () => {
    // Pré-seed du consentement cookies pour simuler une visite suivante.
    writeConsent('essential', { analytics: false });
    renderModal();
    expect(screen.getByTestId('onboarding-dialog')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('ne s’affiche pas si le flag est déjà posé', () => {
    writeConsent('essential', { analytics: false });
    markOnboardingSeen();
    renderModal();
    expect(screen.queryByTestId('onboarding-dialog')).not.toBeInTheDocument();
  });

  it('respecte la prop `open` (override) même sans consentement cookies', () => {
    markOnboardingSeen();
    renderModal({ open: true });
    expect(screen.getByTestId('onboarding-dialog')).toBeInTheDocument();
  });

  // Étape 43 — F17/F18 : auto-affichage gated par le consentement cookies.
  it('NE s’affiche PAS si aucun consentement cookies n’a été choisi (F17/F18)', () => {
    // localStorage vide → readConsent() === null → onboarding différé.
    renderModal();
    expect(screen.queryByTestId('onboarding-dialog')).not.toBeInTheDocument();
  });

  it('s’ouvre dès que le choix cookies est posé (event `mn:consent-changed`)', () => {
    // Pas de consentement initial → modale absente.
    renderModal();
    expect(screen.queryByTestId('onboarding-dialog')).not.toBeInTheDocument();
    // L'utilisateur clique sur « Tout refuser » → writeConsent émet l'event.
    act(() => {
      writeConsent('essential', { analytics: false });
    });
    expect(screen.getByTestId('onboarding-dialog')).toBeInTheDocument();
  });

  it('navigue entre les 4 étapes via Suivant / Revenir', () => {
    renderModal({ open: true });
    // étape 1
    expect(screen.getByRole('heading', { name: /Bienvenue sur Maintenant/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));
    // étape 2
    expect(screen.getByRole('heading', { name: /Pèse sur les décisions/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));
    // étape 3
    expect(screen.getByRole('heading', { name: /Organise et entraide/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /← Revenir/i }));
    // étape 2 à nouveau
    expect(screen.getByRole('heading', { name: /Pèse sur les décisions/i })).toBeInTheDocument();
  });

  it('le dernier step remplace Suivant par un CTA Inscription vers /join', () => {
    renderModal({ open: true });
    fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));
    fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));
    fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));
    expect(
      screen.getByRole('heading', { name: /Rejoins le mouvement/i }),
    ).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: /S.+inscrire/i });
    expect(cta).toHaveAttribute('href', '/join');
  });

  it('Passer ferme la modale et pose le flag', () => {
    renderModal({ open: true });
    fireEvent.click(screen.getByRole('button', { name: /Passer l.onboarding/i }));
    expect(screen.queryByTestId('onboarding-dialog')).not.toBeInTheDocument();
    expect(hasSeenOnboarding()).toBe(true);
  });

  it('Echap ferme la modale', () => {
    renderModal({ open: true });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('onboarding-dialog')).not.toBeInTheDocument();
  });

  it('clic en dehors du dialog ferme la modale', () => {
    renderModal({ open: true });
    fireEvent.click(screen.getByTestId('onboarding-overlay'));
    expect(screen.queryByTestId('onboarding-dialog')).not.toBeInTheDocument();
  });
});
