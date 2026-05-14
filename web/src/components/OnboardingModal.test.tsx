import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import OnboardingModal from './OnboardingModal';
import { hasSeenOnboarding, markOnboardingSeen } from '@/lib/onboarding';

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

  it('s’affiche par défaut si flag absent', () => {
    renderModal();
    expect(screen.getByTestId('onboarding-dialog')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('ne s’affiche pas si le flag est déjà posé', () => {
    markOnboardingSeen();
    renderModal();
    expect(screen.queryByTestId('onboarding-dialog')).not.toBeInTheDocument();
  });

  it('respecte la prop `open` (override)', () => {
    markOnboardingSeen();
    renderModal({ open: true });
    expect(screen.getByTestId('onboarding-dialog')).toBeInTheDocument();
  });

  it('navigue entre les 4 étapes via Suivant / Revenir', () => {
    renderModal();
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
    renderModal();
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
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /Passer l.onboarding/i }));
    expect(screen.queryByTestId('onboarding-dialog')).not.toBeInTheDocument();
    expect(hasSeenOnboarding()).toBe(true);
  });

  it('Echap ferme la modale', () => {
    renderModal();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('onboarding-dialog')).not.toBeInTheDocument();
  });

  it('clic en dehors du dialog ferme la modale', () => {
    renderModal();
    fireEvent.click(screen.getByTestId('onboarding-overlay'));
    expect(screen.queryByTestId('onboarding-dialog')).not.toBeInTheDocument();
  });
});
