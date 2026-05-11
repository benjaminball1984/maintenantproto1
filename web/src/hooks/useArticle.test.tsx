import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as MediaModule from '@/lib/media';

const mocks = vi.hoisted(() => ({
  getArticleBySlug: vi.fn(),
}));

vi.mock('@/lib/media', async () => {
  const actual = await vi.importActual<typeof MediaModule>('@/lib/media');
  return {
    ...actual,
    getArticleBySlug: mocks.getArticleBySlug,
  };
});

import { useArticle } from '@/hooks/useArticle';
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

function Probe({ slug }: { slug: string | undefined }) {
  const { article, status } = useArticle(slug);
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="title">{article?.title ?? ''}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.getArticleBySlug.mockReset();
});

describe('useArticle', () => {
  it('charge l’article et passe en status=ready', async () => {
    mocks.getArticleBySlug.mockResolvedValueOnce({ data: sample, error: null });
    render(<Probe slug={sample.slug} />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('title').textContent).toBe(sample.title);
  });

  it('passe en notfound si data null', async () => {
    mocks.getArticleBySlug.mockResolvedValueOnce({ data: null, error: null });
    render(<Probe slug="absent" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('notfound'));
  });

  it('reste idle sans slug', () => {
    render(<Probe slug={undefined} />);
    expect(screen.getByTestId('status').textContent).toBe('idle');
  });
});
