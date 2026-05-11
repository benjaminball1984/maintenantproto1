import { describe, it, expect, beforeEach, vi } from 'vitest';

// Les mocks doivent être hoistés avant l'import de auth.ts (qui importe supabase).
const mocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signInWithOtp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: mocks,
  },
}));

import { authErrorMessage, useAuthStore } from '@/lib/auth';

const fakeSession = {
  access_token: 'a',
  refresh_token: 'r',
  expires_at: 0,
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'u1', email: 'a@b.c', user_metadata: {} },
};

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({ session: null, user: null, status: 'loading' });
});

describe('useAuthStore', () => {
  it('starts in loading status', () => {
    expect(useAuthStore.getState().status).toBe('loading');
  });

  it('setSession(null) marks anonymous', () => {
    useAuthStore.getState().setSession(null);
    expect(useAuthStore.getState().status).toBe('anonymous');
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('setSession(session) marks authenticated and stores user', () => {
    // @ts-expect-error fakeSession typing is intentionally loose
    useAuthStore.getState().setSession(fakeSession);
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(useAuthStore.getState().user?.id).toBe('u1');
  });

  it('signInWithPassword updates store on success', async () => {
    mocks.signInWithPassword.mockResolvedValueOnce({
      data: { session: fakeSession, user: { id: 'u1', email: 'a@b.c' } },
      error: null,
    });
    const { error } = await useAuthStore
      .getState()
      .signInWithPassword({ email: 'a@b.c', password: 'pwd12345' });
    expect(error).toBeNull();
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: 'a@b.c',
      password: 'pwd12345',
    });
  });

  it('signInWithPassword keeps anonymous status on error', async () => {
    useAuthStore.setState({ session: null, user: null, status: 'anonymous' });
    mocks.signInWithPassword.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: { message: 'bad', code: 'invalid_credentials' },
    });
    const { error } = await useAuthStore
      .getState()
      .signInWithPassword({ email: 'x', password: 'y' });
    expect(error?.code).toBe('invalid_credentials');
    expect(useAuthStore.getState().status).toBe('anonymous');
  });

  it('signUpWithPassword forwards display_name in metadata', async () => {
    mocks.signUp.mockResolvedValueOnce({
      data: { session: null, user: { id: 'u2', email: 'new@x.org' } },
      error: null,
    });
    await useAuthStore.getState().signUpWithPassword({
      email: 'new@x.org',
      password: 'pwd12345',
      displayName: 'New User',
    });
    expect(mocks.signUp).toHaveBeenCalledWith({
      email: 'new@x.org',
      password: 'pwd12345',
      options: { data: { display_name: 'New User' } },
    });
  });

  it('signInWithMagicLink calls signInWithOtp', async () => {
    mocks.signInWithOtp.mockResolvedValueOnce({ data: {}, error: null });
    await useAuthStore.getState().signInWithMagicLink({ email: 'm@x.org' });
    expect(mocks.signInWithOtp).toHaveBeenCalledWith({ email: 'm@x.org' });
  });

  it('resetPasswordForEmail forwards email', async () => {
    mocks.resetPasswordForEmail.mockResolvedValueOnce({ data: {}, error: null });
    await useAuthStore.getState().resetPasswordForEmail('r@x.org');
    expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith('r@x.org');
  });

  it('signOut clears the session and switches to anonymous', async () => {
    // @ts-expect-error fakeSession typing is intentionally loose
    useAuthStore.getState().setSession(fakeSession);
    expect(useAuthStore.getState().status).toBe('authenticated');
    mocks.signOut.mockResolvedValueOnce({ error: null });
    const { error } = await useAuthStore.getState().signOut();
    expect(error).toBeNull();
    expect(useAuthStore.getState().status).toBe('anonymous');
    expect(useAuthStore.getState().session).toBeNull();
  });
});

describe('authErrorMessage', () => {
  it('returns null when no error', () => {
    expect(authErrorMessage(null)).toBeNull();
  });

  it('maps invalid_credentials to French', () => {
    expect(
      authErrorMessage({ name: 'AuthError', message: 'bad', code: 'invalid_credentials' } as never),
    ).toBe('Email ou mot de passe incorrect.');
  });

  it('maps user_already_exists to French', () => {
    expect(
      authErrorMessage({
        name: 'AuthError',
        message: 'exists',
        code: 'user_already_exists',
      } as never),
    ).toBe('Un compte existe déjà avec cet email.');
  });

  it('falls back to raw message for unknown codes', () => {
    expect(
      authErrorMessage({
        name: 'AuthError',
        message: 'Some weird error',
        code: 'whatever',
      } as never),
    ).toBe('Some weird error');
  });
});
