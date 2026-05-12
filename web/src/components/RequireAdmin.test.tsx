import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

const rpcMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: authMocks,
    rpc: rpcMock,
  },
}));

import { useAuthStore } from '@/lib/auth';
import RequireAdmin from './RequireAdmin';

function renderWith(initialPath = '/admin') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <div data-testid="protected">ADMIN PANEL</div>
            </RequireAdmin>
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

describe('RequireAdmin', () => {
  it('redirige vers /?auth=login quand anonymous', async () => {
    useAuthStore.setState({ status: 'anonymous', user: null, session: null });
    renderWith();
    await waitFor(() => expect(screen.getByTestId('landing')).toBeInTheDocument());
    expect(screen.queryByTestId('protected')).toBeNull();
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('redirige vers / quand authentifié non-admin', async () => {
    const fakeSession = {
      access_token: 't',
      user: { id: 'u1', email: 'a@x.org', user_metadata: {} },
    };
    authMocks.getSession.mockResolvedValue({
      data: { session: fakeSession },
      error: null,
    });
    useAuthStore.setState({
      status: 'authenticated',
      user: { id: 'u1', email: 'a@x.org', user_metadata: {} } as never,
      session: fakeSession as never,
    });
    rpcMock.mockResolvedValueOnce({ data: false, error: null });
    renderWith();
    await waitFor(() => expect(screen.getByTestId('landing')).toBeInTheDocument());
    expect(screen.queryByTestId('protected')).toBeNull();
  });

  it('rend les children quand admin', async () => {
    const fakeSession = {
      access_token: 't',
      user: { id: 'u-admin', email: 'a@x.org', user_metadata: {} },
    };
    authMocks.getSession.mockResolvedValue({
      data: { session: fakeSession },
      error: null,
    });
    useAuthStore.setState({
      status: 'authenticated',
      user: { id: 'u-admin', email: 'a@x.org', user_metadata: {} } as never,
      session: fakeSession as never,
    });
    rpcMock.mockResolvedValueOnce({ data: true, error: null });
    renderWith();
    await waitFor(() => expect(screen.getByTestId('protected')).toBeInTheDocument());
  });
});
