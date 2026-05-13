import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as MediaModule from '@/lib/media';

const mediaMocks = vi.hoisted(() => ({
  getArticleBySlug: vi.fn(),
  listComments: vi.fn(),
  listReactions: vi.fn(),
  createComment: vi.fn(),
  react: vi.fn(),
}));

vi.mock('@/lib/media', async () => {
  const actual = await vi.importActual<typeof MediaModule>('@/lib/media');
  return {
    ...actual,
    getArticleBySlug: mediaMocks.getArticleBySlug,
    listComments: mediaMocks.listComments,
    listReactions: mediaMocks.listReactions,
    createComment: mediaMocks.createComment,
    react: mediaMocks.react,
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
import type { ArticleRow, CommentRow, ReactionRow } from '@/lib/media';
import ArticleDetailPage from './ArticleDetailPage';

const article: ArticleRow = {
  id: 'a1',
  author_id: 'u1',
  title: 'Mobilisation pour la justice fiscale',
  slug: 'mobilisation-pour-la-justice-fiscale',
  summary: 'Tour d’horizon des actions citoyennes contre l’évasion fiscale en France.',
  body: 'Le corps de l’article.',
  cover_url: null,
  format: 'enquete',
  status: 'published',
  published_at: '2026-05-01T00:00:00Z',
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

const comment1: CommentRow = {
  id: 'c1',
  article_id: 'a1',
  author_id: 'u2',
  body: 'Excellent article !',
  is_flagged: false,
  created_at: '2026-05-02T00:00:00Z',
  updated_at: '2026-05-02T00:00:00Z',
};

const reaction1: ReactionRow = {
  id: 'r1',
  article_id: 'a1',
  user_id: 'u2',
  kind: 'support',
  created_at: '2026-05-02T00:00:00Z',
};

const fakeSession = {
  access_token: 'a',
  refresh_token: 'r',
  expires_at: 0,
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'u3', email: 'me@x.org', user_metadata: {} },
};

function renderPage(slug = 'mobilisation-pour-la-justice-fiscale') {
  return render(
    <MemoryRouter initialEntries={[`/media/${slug}`]}>
      <Routes>
        <Route path="/media/:slug" element={<ArticleDetailPage />} />
        <Route path="/media" element={<div data-testid="listing">Listing</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mediaMocks.getArticleBySlug.mockReset();
  mediaMocks.listComments.mockReset();
  mediaMocks.listReactions.mockReset();
  mediaMocks.createComment.mockReset();
  mediaMocks.react.mockReset();
  mediaMocks.listComments.mockResolvedValue({ data: [], error: null });
  mediaMocks.listReactions.mockResolvedValue({ data: [], error: null });
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
  useAuthStore.setState({
    status: 'authenticated',
    user: fakeSession.user as never,
    session: fakeSession as never,
  });
});

describe('ArticleDetailPage', () => {
  it('rend le titre et le corps de l’article', async () => {
    mediaMocks.getArticleBySlug.mockResolvedValueOnce({ data: article, error: null });
    renderPage();
    expect(await screen.findByRole('heading', { name: article.title, level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Le corps de l’article.')).toBeInTheDocument();
  });

  it('liste les commentaires', async () => {
    mediaMocks.getArticleBySlug.mockResolvedValueOnce({ data: article, error: null });
    mediaMocks.listComments.mockResolvedValueOnce({ data: [comment1], error: null });
    renderPage();
    expect(await screen.findByText('Excellent article !')).toBeInTheDocument();
  });

  it('liste les compteurs de réactions', async () => {
    mediaMocks.getArticleBySlug.mockResolvedValueOnce({ data: article, error: null });
    mediaMocks.listReactions.mockResolvedValueOnce({ data: [reaction1], error: null });
    renderPage();
    await waitFor(() => {
      const supportButton = screen.getByRole('button', { name: /Soutien \(1\)/i });
      expect(supportButton).toBeInTheDocument();
    });
  });

  it('poste un commentaire', async () => {
    mediaMocks.getArticleBySlug.mockResolvedValueOnce({ data: article, error: null });
    mediaMocks.createComment.mockResolvedValueOnce({
      data: { ...comment1, id: 'c-new', body: 'Bravo !' },
      error: null,
    });
    renderPage();
    const textarea = await screen.findByLabelText(/Votre commentaire/i);
    fireEvent.change(textarea, { target: { value: 'Bravo !' } });
    await act(async () => {
      fireEvent.submit(screen.getByRole('form', { name: /Poster un commentaire/i }));
    });
    await waitFor(() => expect(mediaMocks.createComment).toHaveBeenCalled());
    // L'ajout du commentaire au DOM est une seconde mise à jour d'état
    // (setComments après l'await createComment) que `act` ne couvre pas :
    // le handler est async, donc tout ce qui suit le `await` se résout
    // sur des microtasks ultérieurs. En CI sous charge parallèle, le
    // flush React peut dépasser le timeout waitFor par défaut (1 s).
    // findByText (timeout 5s par défaut côté @testing-library) couvre.
    expect(await screen.findByText('Bravo !')).toBeInTheDocument();
  });

  it('redirige si article introuvable', async () => {
    mediaMocks.getArticleBySlug.mockResolvedValueOnce({ data: null, error: null });
    renderPage();
    expect(await screen.findByTestId('listing')).toBeInTheDocument();
  });
});
