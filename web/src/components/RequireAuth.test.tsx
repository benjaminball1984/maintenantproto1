import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const authMocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signInWithOtp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: authMocks },
}));

import { useAuthStore } from '@/lib/auth';
import RequireAuth from './RequireAuth';

function renderWith(initialPath = '/protected') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <RequireAuth>
              <div data-testid="protected">SECRET</div>
            </RequireAuth>
          }
        />
        <Route path="/" element={<div data-testid="landing">PUBLIC</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
});

describe('RequireAuth', () => {
  it('affiche un spinner tant que useAuth est en loading', () => {
    useAuthStore.setState({ status: 'loading', user: null, session: null });
    renderWith();
    expect(screen.getByRole('status').textContent).toMatch(/Chargement/);
    expect(screen.queryByTestId('protected')).toBeNull();
  });

  it('redirige vers / quand status === anonymous', () => {
    useAuthStore.setState({ status: 'anonymous', user: null, session: null });
    renderWith();
    expect(screen.getByTestId('landing')).toBeInTheDocument();
    expect(screen.queryByTestId('protected')).toBeNull();
  });

  it("rend les children quand l'utilisateur est authentifié", () => {
    useAuthStore.setState({
      status: 'authenticated',
      user: { id: 'u1', email: 'me@x.org', user_metadata: {} } as never,
      session: { access_token: 'a' } as never,
    });
    renderWith();
    expect(screen.getByTestId('protected')).toBeInTheDocument();
  });
});
