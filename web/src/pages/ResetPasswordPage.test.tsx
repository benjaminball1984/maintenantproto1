import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const authMocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signInWithOtp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  exchangeCodeForSession: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: authMocks },
}));

import ResetPasswordPage from './ResetPasswordPage';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<div data-testid="profile">PROFILE</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authMocks.exchangeCodeForSession.mockReset();
  authMocks.updateUser.mockReset();
});

describe('ResetPasswordPage', () => {
  it("affiche un message d'erreur si aucun code n'est présent dans l'URL", () => {
    renderAt('/auth/reset-password');
    expect(screen.getByRole('alert').textContent).toMatch(/Lien invalide/);
    expect(screen.queryByLabelText(/Nouveau mot de passe/i)).toBeNull();
  });

  it('échange le code contre une session puis affiche le formulaire', async () => {
    authMocks.exchangeCodeForSession.mockResolvedValueOnce({
      data: { session: { access_token: 'x' } },
      error: null,
    });
    renderAt('/auth/reset-password?code=abc123');
    await waitFor(() => {
      expect(screen.getByLabelText(/Nouveau mot de passe/i)).toBeInTheDocument();
    });
    expect(authMocks.exchangeCodeForSession).toHaveBeenCalledWith('abc123');
  });

  it('refuse les mots de passe < 8 caractères', async () => {
    authMocks.exchangeCodeForSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });
    renderAt('/auth/reset-password?code=abc');
    await waitFor(() => expect(screen.getByLabelText(/Nouveau mot de passe/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Nouveau mot de passe/i), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/i), {
      target: { value: 'short' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Mettre à jour le mot de passe/i }));
    });
    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toMatch(/au moins 8 caractères/i);
    });
    expect(authMocks.updateUser).not.toHaveBeenCalled();
  });

  it('refuse les mots de passe qui ne correspondent pas', async () => {
    authMocks.exchangeCodeForSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });
    renderAt('/auth/reset-password?code=abc');
    await waitFor(() => expect(screen.getByLabelText(/Nouveau mot de passe/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Nouveau mot de passe/i), {
      target: { value: 'longpassword1' },
    });
    fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/i), {
      target: { value: 'longpassword2' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Mettre à jour le mot de passe/i }));
    });
    expect(await screen.findByText(/ne correspondent pas/i)).toBeInTheDocument();
    expect(authMocks.updateUser).not.toHaveBeenCalled();
  });

  it('submit appelle updateUser puis redirige vers /profile', async () => {
    authMocks.exchangeCodeForSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });
    authMocks.updateUser.mockResolvedValueOnce({
      data: { user: { id: 'u1' } },
      error: null,
    });
    renderAt('/auth/reset-password?code=abc');
    await waitFor(() => expect(screen.getByLabelText(/Nouveau mot de passe/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Nouveau mot de passe/i), {
      target: { value: 'newpassword1' },
    });
    fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/i), {
      target: { value: 'newpassword1' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Mettre à jour le mot de passe/i }));
    });
    expect(authMocks.updateUser).toHaveBeenCalledWith({ password: 'newpassword1' });
    await waitFor(() => expect(screen.getByTestId('profile')).toBeInTheDocument(), {
      timeout: 2000,
    });
  });

  it('remonte une erreur en français si le code est expiré', async () => {
    authMocks.exchangeCodeForSession.mockResolvedValueOnce({
      data: { session: null },
      error: {
        name: 'AuthError',
        message: 'expired',
        code: 'invalid_grant',
      },
    });
    renderAt('/auth/reset-password?code=expired');
    expect(await screen.findByText(/Email ou mot de passe incorrect/i)).toBeInTheDocument();
    // Le formulaire ne s'affiche pas si l'échange a échoué.
    expect(screen.queryByLabelText(/Nouveau mot de passe/i)).toBeNull();
  });
});
