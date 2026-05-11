import { describe, it, expect, beforeEach, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  signInWithOAuth: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: mocks,
  },
}));

import { signInWithProvider } from '@/lib/oauth';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('signInWithProvider', () => {
  it('appelle signInWithOAuth avec provider=google et redirectTo=/auth/callback', async () => {
    mocks.signInWithOAuth.mockResolvedValueOnce({
      data: { url: 'https://accounts.google.com/o/oauth2/auth?…', provider: 'google' },
      error: null,
    });

    const { error } = await signInWithProvider('google');

    expect(error).toBeNull();
    expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  });

  it('appelle signInWithOAuth avec provider=instagram', async () => {
    mocks.signInWithOAuth.mockResolvedValueOnce({
      data: { url: 'https://api.instagram.com/oauth/authorize?…', provider: 'instagram' },
      error: null,
    });

    const { error } = await signInWithProvider('instagram');

    expect(error).toBeNull();
    expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'instagram',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  });

  it("remonte l'erreur Supabase telle quelle (erreur réseau)", async () => {
    const networkError = {
      name: 'AuthRetryableFetchError',
      message: 'Failed to fetch',
      code: 'network_error',
    };
    mocks.signInWithOAuth.mockResolvedValueOnce({
      data: { url: null, provider: 'google' },
      error: networkError,
    });

    const { error } = await signInWithProvider('google');

    expect(error).toEqual(networkError);
  });
});
