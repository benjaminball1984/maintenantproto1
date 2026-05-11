import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const authMocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: authMocks },
}));

import AuthCallbackPage from './AuthCallbackPage';

function renderAt(href: string) {
  // jsdom autorise la mutation directe de window.location.href via assign.
  window.history.replaceState({}, '', href);
  return render(
    <MemoryRouter initialEntries={[href]}>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/profile" element={<div data-testid="profile">PROFILE</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authMocks.exchangeCodeForSession.mockReset();
});

describe('AuthCallbackPage', () => {
  it('échange le code OAuth puis redirige vers /profile', async () => {
    authMocks.exchangeCodeForSession.mockResolvedValueOnce({
      data: { session: { access_token: 'a' }, user: { id: 'u1' } },
      error: null,
    });

    renderAt('/auth/callback?code=valid-code');

    await waitFor(() => expect(screen.getByTestId('profile')).toBeInTheDocument());
    expect(authMocks.exchangeCodeForSession).toHaveBeenCalledTimes(1);
    const firstCall = authMocks.exchangeCodeForSession.mock.calls[0];
    expect(firstCall?.[0]).toMatch(/code=valid-code/);
  });

  it('affiche une erreur quand aucun code n’est présent dans l’URL', async () => {
    renderAt('/auth/callback');

    expect(await screen.findByRole('alert')).toHaveTextContent(/Lien d’authentification/i);
    expect(authMocks.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("mappe une erreur Supabase en français quand l'échange échoue", async () => {
    authMocks.exchangeCodeForSession.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: {
        name: 'AuthError',
        message: 'bad oauth state',
        code: 'bad_oauth_state',
      },
    });

    renderAt('/auth/callback?code=expired');

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalide ou expiré/i);
  });

  it("affiche aussi une erreur quand l'URL ne contient qu'un paramètre error=access_denied", async () => {
    authMocks.exchangeCodeForSession.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: {
        name: 'AuthError',
        message: 'access denied',
        code: 'access_denied',
      },
    });
    renderAt('/auth/callback?error=access_denied&error_description=User+denied');
    expect(await screen.findByRole('alert')).toHaveTextContent(/refusé l’accès/i);
  });
});
