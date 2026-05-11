import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signInWithOtp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
  onAuthStateChange: vi.fn().mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  }),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: mocks },
}));

import AuthModal from './AuthModal';
import { useAuthStore } from '@/lib/auth';

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({ session: null, user: null, status: 'anonymous' });
});

function renderModal(onClose = vi.fn()) {
  return { onClose, ...render(<AuthModal open onClose={onClose} />) };
}

describe('AuthModal — rendu', () => {
  it("affiche l'écran login par défaut", () => {
    renderModal();
    expect(screen.getByRole('heading', { name: /Connexion/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
  });

  it("bascule sur l'écran signup", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole('button', { name: /Créer un compte/i }));
    expect(screen.getByRole('heading', { name: /Créer un compte/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Prénom & nom/i)).toBeInTheDocument();
  });

  it("bascule sur l'écran forgot", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole('button', { name: /Mot de passe oublié/i }));
    expect(
      screen.getByRole('heading', { name: /Réinitialiser le mot de passe/i }),
    ).toBeInTheDocument();
    // En mode forgot, on ne demande PAS de mot de passe : seul l'email reste.
    expect(screen.queryByLabelText(/^Mot de passe$/i)).not.toBeInTheDocument();
  });
});

describe('AuthModal — interactions', () => {
  it('appelle signInWithPassword au submit du formulaire login', async () => {
    mocks.signInWithPassword.mockResolvedValueOnce({
      data: { session: { user: { id: 'u1' } }, user: { id: 'u1' } },
      error: null,
    });
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal(onClose);
    await user.type(screen.getByLabelText(/Email/i), 'me@maintenant.org');
    await user.type(screen.getByLabelText(/Mot de passe/i), 'verylongpwd');
    await user.click(screen.getByRole('button', { name: /Se connecter/i }));
    await waitFor(() => {
      expect(mocks.signInWithPassword).toHaveBeenCalledWith({
        email: 'me@maintenant.org',
        password: 'verylongpwd',
      });
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("affiche un message d'erreur en français quand Supabase répond invalid_credentials", async () => {
    mocks.signInWithPassword.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: { name: 'AuthError', message: 'bad', code: 'invalid_credentials' },
    });
    const user = userEvent.setup();
    renderModal();
    await user.type(screen.getByLabelText(/Email/i), 'me@maintenant.org');
    await user.type(screen.getByLabelText(/Mot de passe/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /Se connecter/i }));
    expect(await screen.findByText(/Email ou mot de passe incorrect/i)).toBeInTheDocument();
  });

  it('appelle signUp au submit de signup avec display_name dans les metadata', async () => {
    mocks.signUp.mockResolvedValueOnce({
      data: { session: null, user: { id: 'u9', email: 'new@x.org' } },
      error: null,
    });
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole('button', { name: /Créer un compte/i }));
    await user.type(screen.getByLabelText(/Prénom & nom/i), 'Camille Test');
    await user.type(screen.getByLabelText(/Email/i), 'camille@m.org');
    await user.type(screen.getByLabelText(/Mot de passe/i), 'longpassword');
    await user.click(screen.getByRole('button', { name: /Créer mon compte/i }));
    await waitFor(() => {
      expect(mocks.signUp).toHaveBeenCalledWith({
        email: 'camille@m.org',
        password: 'longpassword',
        options: { data: { display_name: 'Camille Test' } },
      });
    });
    expect(await screen.findByText(/Vérifiez votre boîte mail/i)).toBeInTheDocument();
  });

  it('ferme la modale quand on appuie sur Echap', async () => {
    const onClose = vi.fn();
    renderModal(onClose);
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(onClose).toHaveBeenCalled();
  });
});
