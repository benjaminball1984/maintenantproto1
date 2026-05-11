import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type * as MediaModule from '@/lib/media';

const mediaMocks = vi.hoisted(() => ({
  listArticles: vi.fn(),
}));

vi.mock('@/lib/media', async () => {
  const actual = await vi.importActual<typeof MediaModule>('@/lib/media');
  return {
    ...actual,
    listArticles: mediaMocks.listArticles,
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
import type { ArticleRow } from '@/lib/media';
import MediaPage from './MediaPage';

const sample: ArticleRow = {
  id: 'a1',
  author_id: 'u1',
  title: 'Mobilisation pour la justice fiscale',
  slug: 'mobilisation-pour-la-justice-fiscale',
  summary: 'Tour d’horizon des actions citoyennes contre l’évasion fiscale en France.',
  body: 'corps complet…',
  cover_url: null,
  format: 'enquete',
  status: 'published',
  published_at: '2026-05-01T00:00:00Z',
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/media']}>
      <MediaPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mediaMocks.listArticles.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('MediaPage', () => {
  it('rend le listing avec compteur', async () => {
    mediaMocks.listArticles.mockResolvedValueOnce({ data: [sample], error: null });
    renderPage();
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(1));
    expect(screen.getByText(/1 article/i)).toBeInTheDocument();
    expect(screen.getByText(sample.title)).toBeInTheDocument();
  });

  it('affiche l’état vide quand aucun article', async () => {
    mediaMocks.listArticles.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    expect(await screen.findByText(/Aucun article publié/i)).toBeInTheDocument();
  });

  it('expose le filtre format', async () => {
    mediaMocks.listArticles.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    expect(await screen.findByLabelText(/Filtrer par format/i)).toBeInTheDocument();
  });
});
