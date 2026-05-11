import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as SocialModule from '@/lib/social';

const mocks = vi.hoisted(() => ({
  listPosts: vi.fn(),
}));

vi.mock('@/lib/social', async () => {
  const actual = await vi.importActual<typeof SocialModule>('@/lib/social');
  return {
    ...actual,
    listPosts: mocks.listPosts,
  };
});

import { usePosts } from '@/hooks/usePosts';
import type { PostRow } from '@/lib/social';

const sample: PostRow = {
  id: 'p1',
  author_id: 'u1',
  body: 'On y va !',
  media_urls: [],
  visibility: 'public',
  is_flagged: false,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

function Probe() {
  const { posts, status } = usePosts();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="count">{posts.length}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.listPosts.mockReset();
});

describe('usePosts', () => {
  it('charge le feed et passe en status=ready', async () => {
    mocks.listPosts.mockResolvedValueOnce({ data: [sample], error: null });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('passe en status=error sur erreur', async () => {
    mocks.listPosts.mockResolvedValueOnce({
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
