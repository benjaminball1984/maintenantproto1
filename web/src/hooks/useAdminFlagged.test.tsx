import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as AdminModule from '@/lib/admin';

const mocks = vi.hoisted(() => ({
  listFlaggedArticles: vi.fn(),
  listFlaggedPosts: vi.fn(),
  listFlaggedPostComments: vi.fn(),
  listFlaggedComments: vi.fn(),
}));

vi.mock('@/lib/admin', async () => {
  const actual = await vi.importActual<typeof AdminModule>('@/lib/admin');
  return {
    ...actual,
    listFlaggedArticles: mocks.listFlaggedArticles,
    listFlaggedPosts: mocks.listFlaggedPosts,
    listFlaggedPostComments: mocks.listFlaggedPostComments,
    listFlaggedComments: mocks.listFlaggedComments,
  };
});

import { useAdminFlagged } from '@/hooks/useAdminFlagged';

function Probe({ enabled }: { enabled: boolean }) {
  const { items, status } = useAdminFlagged(enabled);
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="count">{items.length}</span>
      <span data-testid="first">{items[0]?.id ?? ''}</span>
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useAdminFlagged', () => {
  it('reste idle quand enabled=false', () => {
    render(<Probe enabled={false} />);
    expect(screen.getByTestId('status').textContent).toBe('idle');
    expect(mocks.listFlaggedArticles).not.toHaveBeenCalled();
  });

  it('agrège les 4 sources et trie par createdAt DESC', async () => {
    mocks.listFlaggedArticles.mockResolvedValueOnce({
      data: [
        {
          kind: 'article',
          id: 'a1',
          authorId: 'u1',
          body: 'A',
          createdAt: '2026-05-01T00:00:00Z',
        },
      ],
      error: null,
    });
    mocks.listFlaggedPosts.mockResolvedValueOnce({
      data: [
        {
          kind: 'post',
          id: 'p1',
          authorId: 'u2',
          body: 'P',
          createdAt: '2026-05-03T00:00:00Z',
        },
      ],
      error: null,
    });
    mocks.listFlaggedPostComments.mockResolvedValueOnce({
      data: [
        {
          kind: 'post_comment',
          id: 'pc1',
          authorId: 'u2',
          body: 'PC',
          createdAt: '2026-05-02T00:00:00Z',
        },
      ],
      error: null,
    });
    mocks.listFlaggedComments.mockResolvedValueOnce({ data: [], error: null });
    render(<Probe enabled={true} />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('count').textContent).toBe('3');
    expect(screen.getByTestId('first').textContent).toBe('p1');
  });

  it('passe en error si une source échoue', async () => {
    mocks.listFlaggedArticles.mockResolvedValueOnce({ data: [], error: null });
    mocks.listFlaggedPosts.mockResolvedValueOnce({
      data: [],
      error: { code: '42501', message: 'denied', details: '', hint: '', name: 'PostgrestError' },
    });
    mocks.listFlaggedPostComments.mockResolvedValueOnce({ data: [], error: null });
    mocks.listFlaggedComments.mockResolvedValueOnce({ data: [], error: null });
    render(<Probe enabled={true} />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('error'));
  });
});
