import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import type * as PollsModule from '@/lib/polls';

const mocks = vi.hoisted(() => ({
  getPoll: vi.fn(),
  getUserVote: vi.fn(),
}));

vi.mock('@/lib/polls', async () => {
  const actual = await vi.importActual<typeof PollsModule>('@/lib/polls');
  return {
    ...actual,
    getPoll: mocks.getPoll,
    getUserVote: mocks.getUserVote,
  };
});

import { usePoll } from '@/hooks/usePoll';
import type { PollOptionRow, PollRow, PollWithOptions } from '@/lib/polls';

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

const sampleOptions: PollOptionRow[] = [
  {
    id: 'o1',
    poll_id: 'p1',
    label: '−40%',
    position: 0,
    vote_count: 10,
    created_at: '2026-05-01T00:00:00Z',
  },
  {
    id: 'o2',
    poll_id: 'p1',
    label: '−60%',
    position: 1,
    vote_count: 25,
    created_at: '2026-05-01T00:00:00Z',
  },
];

const samplePollWithOptions: PollWithOptions = { poll: samplePoll, options: sampleOptions };

function Probe({ slug, userId }: { slug: string | undefined; userId: string | null }) {
  const { poll, options, status, userOptionId, refresh } = usePoll(slug, userId);
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="question">{poll?.question ?? 'none'}</span>
      <span data-testid="opt-count">{options.length}</span>
      <span data-testid="userOpt">{userOptionId ?? 'none'}</span>
      <button type="button" onClick={() => void refresh()}>
        refresh
      </button>
    </div>
  );
}

beforeEach(() => {
  mocks.getPoll.mockReset();
  mocks.getUserVote.mockReset();
});

describe('usePoll', () => {
  it('charge le poll + options et reste userOptionId=none si userId null', async () => {
    mocks.getPoll.mockResolvedValueOnce({ data: samplePollWithOptions, error: null });
    render(<Probe slug="climat-2026" userId={null} />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('question').textContent).toBe('Quel objectif climat ?');
    expect(screen.getByTestId('opt-count').textContent).toBe('2');
    expect(screen.getByTestId('userOpt').textContent).toBe('none');
    expect(mocks.getUserVote).not.toHaveBeenCalled();
  });

  it('renvoie status=notfound quand getPoll renvoie data: null', async () => {
    mocks.getPoll.mockResolvedValueOnce({ data: null, error: null });
    render(<Probe slug="inconnu" userId={null} />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('notfound'));
  });

  it('charge userOptionId via getUserVote quand userId fourni', async () => {
    mocks.getPoll.mockResolvedValueOnce({ data: samplePollWithOptions, error: null });
    mocks.getUserVote.mockResolvedValueOnce({ optionId: 'o2', error: null });
    render(<Probe slug="climat-2026" userId="u1" />);
    await waitFor(() => expect(screen.getByTestId('userOpt').textContent).toBe('o2'));
    expect(mocks.getUserVote).toHaveBeenCalledWith('p1', 'u1');
  });

  it('refresh relance getPoll et met à jour les compteurs', async () => {
    mocks.getPoll.mockResolvedValueOnce({ data: samplePollWithOptions, error: null });
    mocks.getUserVote.mockResolvedValueOnce({ optionId: null, error: null });
    render(<Probe slug="climat-2026" userId="u1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));

    const updatedOptions = [
      { ...sampleOptions[0]!, vote_count: 11 },
      { ...sampleOptions[1]!, vote_count: 25 },
    ];
    mocks.getPoll.mockResolvedValueOnce({
      data: { poll: samplePoll, options: updatedOptions },
      error: null,
    });
    mocks.getUserVote.mockResolvedValueOnce({ optionId: 'o1', error: null });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'refresh' }));
    });
    await waitFor(() => expect(screen.getByTestId('userOpt').textContent).toBe('o1'));
  });
});
