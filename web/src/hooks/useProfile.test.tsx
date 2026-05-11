import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import type * as ProfileModule from '@/lib/profile';

const mocks = vi.hoisted(() => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock('@/lib/profile', async () => {
  const actual = await vi.importActual<typeof ProfileModule>('@/lib/profile');
  return {
    ...actual,
    getProfile: mocks.getProfile,
    updateProfile: mocks.updateProfile,
  };
});

const fakeSession = {
  access_token: 'a',
  refresh_token: 'r',
  expires_at: 0,
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'u1', email: 'me@x.org', user_metadata: {} },
};

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
import { useProfile } from '@/hooks/useProfile';

const sampleRow = {
  id: 'u1',
  email: 'me@x.org',
  display_name: 'Me',
  avatar_url: null,
  bio: null,
  city: null,
  postal_code: null,
  is_admin: false,
  t99cp_balance: 12,
  badges: [],
  created_at: '2025-01-01',
  updated_at: '2025-01-01',
};

function Probe() {
  const { profile, status, refresh, update } = useProfile();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="name">{profile?.display_name ?? 'none'}</span>
      <button type="button" onClick={() => void refresh()}>
        refresh
      </button>
      <button type="button" onClick={() => void update({ display_name: 'Renamed' })}>
        rename
      </button>
    </div>
  );
}

beforeEach(() => {
  mocks.getProfile.mockReset();
  mocks.updateProfile.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({
    data: { session: fakeSession },
    error: null,
  });
  useAuthStore.setState({
    status: 'authenticated',
    user: fakeSession.user as never,
    session: fakeSession as never,
  });
});

describe('useProfile', () => {
  it("charge le profil au mount quand l'utilisateur est authentifié", async () => {
    mocks.getProfile.mockResolvedValueOnce({ data: sampleRow, error: null });
    render(<Probe />);
    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('ready');
    });
    expect(screen.getByTestId('name').textContent).toBe('Me');
    expect(mocks.getProfile).toHaveBeenCalledWith('u1');
  });

  it('passe en error si getProfile renvoie une erreur RLS', async () => {
    mocks.getProfile.mockResolvedValueOnce({
      data: null,
      error: {
        message: 'denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    render(<Probe />);
    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('error');
    });
  });

  it('refresh relance getProfile et met à jour la donnée', async () => {
    mocks.getProfile.mockResolvedValueOnce({ data: sampleRow, error: null });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('name').textContent).toBe('Me'));
    mocks.getProfile.mockResolvedValueOnce({
      data: { ...sampleRow, display_name: 'Refreshed' },
      error: null,
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'refresh' }));
    });
    await waitFor(() => expect(screen.getByTestId('name').textContent).toBe('Refreshed'));
    expect(mocks.getProfile).toHaveBeenCalledTimes(2);
  });

  it('update appelle updateProfile avec le patch et met à jour le state', async () => {
    mocks.getProfile.mockResolvedValueOnce({ data: sampleRow, error: null });
    mocks.updateProfile.mockResolvedValueOnce({
      data: { ...sampleRow, display_name: 'Renamed' },
      error: null,
    });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('name').textContent).toBe('Me'));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'rename' }));
    });
    await waitFor(() => expect(screen.getByTestId('name').textContent).toBe('Renamed'));
    expect(mocks.updateProfile).toHaveBeenCalledWith('u1', { display_name: 'Renamed' });
  });
});
