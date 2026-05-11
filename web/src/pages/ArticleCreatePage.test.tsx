import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as MediaModule from '@/lib/media';

const mediaMocks = vi.hoisted(() => ({
  createArticle: vi.fn(),
}));

vi.mock('@/lib/media', async () => {
  const actual = await vi.importActual<typeof MediaModule>('@/lib/media');
  return {
    ...actual,
    createArticle: mediaMocks.createArticle,
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
import { ARTICLE_BODY_MIN } from '@/lib/media';
import ArticleCreatePage from './ArticleCreatePage';

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
    <MemoryRouter initialEntries={['/media/new']}>
      <Routes>
        <Route path="/media/new" element={<ArticleCreatePage />} />
        <Route path="/media/:slug" element={<div data-testid="detail">Detail</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mediaMocks.createArticle.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
  useAuthStore.setState({
    status: 'authenticated',
    user: fakeSession.user as never,
    session: fakeSession as never,
  });
});

describe('ArticleCreatePage', () => {
  it('refuse un input invalide sans appeler createArticle', async () => {
    renderPage();
    const submit = screen.getByRole('button', { name: /Publier l’article/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    expect(mediaMocks.createArticle).not.toHaveBeenCalled();
    expect(screen.getByText(/Le titre doit faire/i)).toBeInTheDocument();
  });

  it('publie un article valide et redirige', async () => {
    mediaMocks.createArticle.mockResolvedValueOnce({
      data: {
        id: 'a1',
        author_id: 'u1',
        title: 'Mobilisation pour la justice fiscale',
        slug: 'mobilisation-pour-la-justice-fiscale',
        summary: 'a'.repeat(50),
        body: 'a'.repeat(ARTICLE_BODY_MIN + 10),
        cover_url: null,
        format: 'article',
        status: 'published',
        published_at: '2026-05-01T00:00:00Z',
        created_at: '2026-05-01T00:00:00Z',
        updated_at: '2026-05-01T00:00:00Z',
      },
      error: null,
    });
    renderPage();
    fireEvent.change(screen.getByLabelText(/^Titre$/), {
      target: { value: 'Mobilisation pour la justice fiscale' },
    });
    fireEvent.change(screen.getByLabelText(/Résumé/i), {
      target: { value: 'a'.repeat(50) },
    });
    fireEvent.change(screen.getByLabelText(/^Contenu$/), {
      target: { value: 'a'.repeat(ARTICLE_BODY_MIN + 10) },
    });
    await act(async () => {
      fireEvent.submit(screen.getByRole('form', { name: /Création d’article/i }));
    });
    await waitFor(() => expect(mediaMocks.createArticle).toHaveBeenCalled());
    expect(await screen.findByTestId('detail')).toBeInTheDocument();
  });
});
