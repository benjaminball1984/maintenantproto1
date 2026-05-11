import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as PollsModule from '@/lib/polls';

const mocks = vi.hoisted(() => ({
  listPolls: vi.fn(),
}));

vi.mock('@/lib/polls', async () => {
  const actual = await vi.importActual<typeof PollsModule>('@/lib/polls');
  return {
    ...actual,
    listPolls: mocks.listPolls,
  };
});

import { usePolls } from '@/hooks/usePolls';
import type { PollRow } from '@/lib/polls';

const samplePoll: PollRow = {
  id: 'p1',
  author_id: 'u1',
  slug: 'climat-2026',
  question: 'Quel objectif climat ?',
  description: 'Question soumise au mouvement.',
  members_only: true,
  closes_at: null,
  status: 'published',
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

function Probe({ search }: { search?: string }) {
  const { polls, status, error } = usePolls({ search });
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="count">{polls.length}</span>
      <span data-testid="error">{error?.code ?? 'none'}</span>
      <ul>
        {polls.map((p) => (
          <li key={p.id} data-testid="poll">
            {p.question}
          </li>
        ))}
      </ul>
    </div>
  );
}

beforeEach(() => {
  mocks.listPolls.mockReset();
});

describe('usePolls', () => {
  it('charge la liste au mount et passe en status=ready', async () => {
    mocks.listPolls.mockResolvedValueOnce({ data: [samplePoll], error: null });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(mocks.listPolls).toHaveBeenCalledWith(expect.objectContaining({ search: undefined }));
  });

  it('passe en status=error quand listPolls remonte une erreur', async () => {
    mocks.listPolls.mockResolvedValueOnce({
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
    expect(screen.getByTestId('error').textContent).toBe('42501');
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('relance la requête quand search change', async () => {
    mocks.listPolls.mockResolvedValueOnce({ data: [samplePoll], error: null });
    const { rerender } = render(<Probe search="climat" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(mocks.listPolls).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'climat' }));

    mocks.listPolls.mockResolvedValueOnce({
      data: [{ ...samplePoll, id: 'p2', question: 'Autre question' }],
      error: null,
    });
    rerender(<Probe search="école" />);
    await waitFor(() =>
      expect(mocks.listPolls).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'école' }),
      ),
    );
  });
});
