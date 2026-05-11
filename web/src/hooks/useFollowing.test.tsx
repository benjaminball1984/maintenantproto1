import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as SocialModule from '@/lib/social';

const mocks = vi.hoisted(() => ({
  listFollowing: vi.fn(),
}));

vi.mock('@/lib/social', async () => {
  const actual = await vi.importActual<typeof SocialModule>('@/lib/social');
  return {
    ...actual,
    listFollowing: mocks.listFollowing,
  };
});

import { useFollowing } from '@/hooks/useFollowing';
import type { FollowRow } from '@/lib/social';

const sample: FollowRow = {
  id: 'f1',
  follower_id: 'u1',
  followee_id: 'u2',
  created_at: '2026-05-01T00:00:00Z',
};

function Probe({ id }: { id: string | undefined }) {
  const { following, status } = useFollowing(id);
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="count">{following.length}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.listFollowing.mockReset();
});

describe('useFollowing', () => {
  it('charge les abonnements et passe en status=ready', async () => {
    mocks.listFollowing.mockResolvedValueOnce({ data: [sample], error: null });
    render(<Probe id="u1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('reste idle si pas d’id', () => {
    render(<Probe id={undefined} />);
    expect(screen.getByTestId('status').textContent).toBe('idle');
  });

  it('passe en status=error sur erreur', async () => {
    mocks.listFollowing.mockResolvedValueOnce({
      data: [],
      error: {
        message: 'denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    render(<Probe id="u1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('error'));
  });
});
