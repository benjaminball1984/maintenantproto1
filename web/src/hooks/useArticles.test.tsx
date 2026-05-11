import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as MediaModule from '@/lib/media';

const mocks = vi.hoisted(() => ({
  listArticles: vi.fn(),
}));

vi.mock('@/lib/media', async () => {
  const actual = await vi.importActual<typeof MediaModule>('@/lib/media');
  return {
    ...actual,
    listArticles: mocks.listArticles,
  };
});

import { useArticles } from '@/hooks/useArticles';
import type { ArticleRow } from '@/lib/media';

const sample: ArticleRow = {
  id: 'a1',
  author_id: 'u1',
  title: 'Mobilisation pour la justice fiscale',
  slug: 'mobilisation-pour-la-justice-fiscale',
  summary: 'Tour d’horizon des actions citoyennes contre l’évasion fiscale et la fraude.',
  body: 'corps',
  cover_url: null,
  format: 'article',
  status: 'published',
  published_at: '2026-05-01T00:00:00Z',
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

function Probe() {
  const { articles, status } = useArticles();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="count">{articles.length}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.listArticles.mockReset();
});

describe('useArticles', () => {
  it('charge la liste et passe en status=ready', async () => {
    mocks.listArticles.mockResolvedValueOnce({ data: [sample], error: null });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('passe en status=error sur erreur', async () => {
    mocks.listArticles.mockResolvedValueOnce({
      data: [],
      error: {
        message: 'denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('error'));
  });
});
