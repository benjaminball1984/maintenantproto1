import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

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
import { useIsAdmin } from '@/hooks/useIsAdmin';

function Probe() {
  const { isAdmin, status } = useIsAdmin();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="admin">{isAdmin ? 'yes' : 'no'}</span>
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
});

describe('useIsAdmin', () => {
  it('passe ready / non-admin pour les anonymes', async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    useAuthStore.setState({ status: 'anonymous', user: null, session: null });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('admin').textContent).toBe('no');
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('appelle la RPC et renvoie true pour un admin', async () => {
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
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('admin').textContent).toBe('yes'));
    expect(rpcMock).toHaveBeenCalledWith('is_admin', { uid: 'u-admin' });
    expect(screen.getByTestId('status').textContent).toBe('ready');
  });

  it('renvoie non-admin si la RPC répond false', async () => {
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
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('admin').textContent).toBe('no');
  });
});
