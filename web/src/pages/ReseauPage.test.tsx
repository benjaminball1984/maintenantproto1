import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type * as SocialModule from '@/lib/social';

const socialMocks = vi.hoisted(() => ({
  listPosts: vi.fn(),
  listFollowing: vi.fn(),
  createPost: vi.fn(),
}));

vi.mock('@/lib/social', async () => {
  const actual = await vi.importActual<typeof SocialModule>('@/lib/social');
  return {
    ...actual,
    listPosts: socialMocks.listPosts,
    listFollowing: socialMocks.listFollowing,
    createPost: socialMocks.createPost,
  };
});

const authMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: authMocks },
}));

import { useAuthStore } from '@/lib/auth';
import type { PostRow } from '@/lib/social';
import ReseauPage from './ReseauPage';

const post1: PostRow = {
  id: 'p1',
  author_id: 'u1',
  body: 'Communiqué : grève reconductible.',
  media_urls: [],
  visibility: 'public',
  is_flagged: false,
  created_at: '2026-05-01T10:00:00Z',
  updated_at: '2026-05-01T10:00:00Z',
};

const fakeSession = {
  access_token: 'a',
  refresh_token: 'r',
  expires_at: 0,
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'u1', email: 'me@x.org', user_metadata: {} },
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/reseau']}>
      <ReseauPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  socialMocks.listPosts.mockReset();
  socialMocks.listFollowing.mockReset();
  socialMocks.createPost.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
  socialMocks.listFollowing.mockResolvedValue({ data: [], error: null });
});

describe('ReseauPage', () => {
  it('rend le feed avec les posts publics', async () => {
    socialMocks.listPosts.mockResolvedValueOnce({ data: [post1], error: null });
    renderPage();
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(1));
    expect(screen.getByText(/Communiqué : grève reconductible./)).toBeInTheDocument();
    expect(screen.getByText(/1 post/i)).toBeInTheDocument();
  });

  it('affiche le composer si utilisateur connecté', async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
    useAuthStore.setState({
      status: 'authenticated',
      user: fakeSession.user as never,
      session: fakeSession as never,
    });
    socialMocks.listPosts.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    expect(await screen.findByRole('form', { name: /Publier un post/i })).toBeInTheDocument();
  });

  it('publie un post valide via createPost', async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
    useAuthStore.setState({
      status: 'authenticated',
      user: fakeSession.user as never,
      session: fakeSession as never,
    });
    socialMocks.listPosts.mockResolvedValueOnce({ data: [], error: null });
    socialMocks.createPost.mockResolvedValueOnce({ data: post1, error: null });
    socialMocks.listPosts.mockResolvedValueOnce({ data: [post1], error: null });
    renderPage();
    const textarea = await screen.findByLabelText(/^Publier$/i);
    fireEvent.change(textarea, { target: { value: 'Mon nouveau post' } });
    await act(async () => {
      fireEvent.submit(screen.getByRole('form', { name: /Publier un post/i }));
    });
    await waitFor(() => expect(socialMocks.createPost).toHaveBeenCalled());
    const arg = socialMocks.createPost.mock.calls[0]?.[0] as { body: string };
    expect(arg.body).toBe('Mon nouveau post');
  });

  it('affiche l’état vide quand aucun post', async () => {
    socialMocks.listPosts.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    expect(await screen.findByText(/Aucun post pour le moment/i)).toBeInTheDocument();
  });
});
