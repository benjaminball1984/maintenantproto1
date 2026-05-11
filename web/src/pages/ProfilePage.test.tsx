import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import type * as ProfileModule from '@/lib/profile';

const profileMocks = vi.hoisted(() => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  uploadAvatar: vi.fn(),
}));

vi.mock('@/lib/profile', async () => {
  const actual = await vi.importActual<typeof ProfileModule>('@/lib/profile');
  return {
    ...actual,
    getProfile: profileMocks.getProfile,
    updateProfile: profileMocks.updateProfile,
    uploadAvatar: profileMocks.uploadAvatar,
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
import ProfilePage from './ProfilePage';

const sampleRow = {
  id: 'u1',
  email: 'me@x.org',
  display_name: 'Camille',
  avatar_url: null,
  bio: 'Militant·e du quotidien.',
  city: 'Lyon',
  postal_code: '69001',
  is_admin: false,
  t99cp_balance: 42,
  badges: ['Pionnier'],
  created_at: '2025-01-15',
  updated_at: '2025-01-15',
};

beforeEach(() => {
  profileMocks.getProfile.mockReset();
  profileMocks.updateProfile.mockReset();
  profileMocks.uploadAvatar.mockReset();
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

describe('ProfilePage — rendu', () => {
  it('affiche les données du profil en mode lecture', async () => {
    profileMocks.getProfile.mockResolvedValueOnce({ data: sampleRow, error: null });
    render(<ProfilePage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Camille' })).toBeInTheDocument();
    });
    expect(screen.getByText('me@x.org')).toBeInTheDocument();
    expect(screen.getByText('Lyon')).toBeInTheDocument();
    expect(screen.getByText('69001')).toBeInTheDocument();
    expect(screen.getByText('Pionnier')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('bascule en mode édition au clic sur « Modifier »', async () => {
    profileMocks.getProfile.mockResolvedValueOnce({ data: sampleRow, error: null });
    render(<ProfilePage />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Modifier/i })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: /Modifier le profil/i }));
    expect(screen.getByLabelText(/Nom d’affichage/i)).toHaveValue('Camille');
    expect(screen.getByLabelText(/Ville/i)).toHaveValue('Lyon');
  });
});

describe('ProfilePage — édition', () => {
  it('submit appelle updateProfile avec les valeurs trimées', async () => {
    profileMocks.getProfile.mockResolvedValueOnce({ data: sampleRow, error: null });
    profileMocks.updateProfile.mockResolvedValueOnce({
      data: { ...sampleRow, display_name: 'Camille B', city: 'Paris' },
      error: null,
    });
    render(<ProfilePage />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Modifier le profil/i })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: /Modifier le profil/i }));
    const nameInput = screen.getByLabelText(/Nom d’affichage/i);
    fireEvent.change(nameInput, { target: { value: '  Camille B  ' } });
    const cityInput = screen.getByLabelText(/Ville/i);
    fireEvent.change(cityInput, { target: { value: 'Paris' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    });
    await waitFor(() => {
      expect(profileMocks.updateProfile).toHaveBeenCalledWith('u1', {
        display_name: 'Camille B',
        bio: 'Militant·e du quotidien.',
        city: 'Paris',
        postal_code: '69001',
      });
    });
  });

  it("affiche l'erreur 42501 (permission denied) traduite en français", async () => {
    profileMocks.getProfile.mockResolvedValueOnce({ data: sampleRow, error: null });
    profileMocks.updateProfile.mockResolvedValueOnce({
      data: null,
      error: {
        message: 'permission denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    render(<ProfilePage />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Modifier le profil/i })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: /Modifier le profil/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));
    });
    expect(await screen.findByText(/Vous n’avez pas les droits/i)).toBeInTheDocument();
  });

  it('upload avatar : appelle uploadAvatar puis updateProfile avec le nouvel URL', async () => {
    profileMocks.getProfile.mockResolvedValueOnce({ data: sampleRow, error: null });
    profileMocks.uploadAvatar.mockResolvedValueOnce({
      data: { path: 'u1/avatar.jpg', publicUrl: 'https://cdn/u1/avatar.jpg' },
      error: null,
    });
    profileMocks.updateProfile.mockResolvedValueOnce({
      data: { ...sampleRow, avatar_url: 'https://cdn/u1/avatar.jpg' },
      error: null,
    });
    render(<ProfilePage />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Modifier le profil/i })).toBeInTheDocument(),
    );
    const file = new File([new Uint8Array(512)], 'avatar.jpg', { type: 'image/jpeg' });
    const input = document.getElementById('profile-avatar-input') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    await waitFor(() => {
      expect(profileMocks.uploadAvatar).toHaveBeenCalledWith('u1', file);
    });
    await waitFor(() => {
      expect(profileMocks.updateProfile).toHaveBeenCalledWith('u1', {
        avatar_url: 'https://cdn/u1/avatar.jpg',
      });
    });
  });

  it('annule l’édition sans sauvegarder', async () => {
    profileMocks.getProfile.mockResolvedValueOnce({ data: sampleRow, error: null });
    render(<ProfilePage />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Modifier le profil/i })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: /Modifier le profil/i }));
    fireEvent.change(screen.getByLabelText(/Nom d’affichage/i), {
      target: { value: 'Other' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Annuler/i }));
    expect(profileMocks.updateProfile).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Camille' })).toBeInTheDocument();
  });
});
