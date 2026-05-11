import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as PollsModule from '@/lib/polls';

const pollsMocks = vi.hoisted(() => ({
  getPoll: vi.fn(),
  getUserVote: vi.fn(),
  votePoll: vi.fn(),
  unvotePoll: vi.fn(),
}));

vi.mock('@/lib/polls', async () => {
  const actual = await vi.importActual<typeof PollsModule>('@/lib/polls');
  return {
    ...actual,
    getPoll: pollsMocks.getPoll,
    getUserVote: pollsMocks.getUserVote,
    votePoll: pollsMocks.votePoll,
    unvotePoll: pollsMocks.unvotePoll,
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
import type { PollOptionRow, PollRow, PollWithOptions } from '@/lib/polls';
import PollDetailPage from './PollDetailPage';

const fakeSession = {
  access_token: 'a',
  refresh_token: 'r',
  expires_at: 0,
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'u1', email: 'me@x.org', user_metadata: {} },
};

const samplePoll: PollRow = {
  id: 'p1',
  author_id: 'u1',
  slug: 'climat-2026',
  question: 'Quel objectif climat ?',
  description: 'Consultation interne.',
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
    label: '−40% CO2',
    position: 0,
    vote_count: 10,
    created_at: '2026-05-01T00:00:00Z',
  },
  {
    id: 'o2',
    poll_id: 'p1',
    label: '−60% CO2',
    position: 1,
    vote_count: 25,
    created_at: '2026-05-01T00:00:00Z',
  },
];

const samplePollWithOptions: PollWithOptions = { poll: samplePoll, options: sampleOptions };

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/polls/climat-2026']}>
      <Routes>
        <Route path="/polls/:slug" element={<PollDetailPage />} />
        <Route path="/polls" element={<div data-testid="listing">Listing</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  pollsMocks.getPoll.mockReset();
  pollsMocks.getUserVote.mockReset();
  pollsMocks.votePoll.mockReset();
  pollsMocks.unvotePoll.mockReset();
  authMocks.getSession.mockReset();
});

describe('PollDetailPage', () => {
  it('rend la fiche avec question + options', async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    useAuthStore.setState({ status: 'anonymous', user: null, session: null });
    pollsMocks.getPoll.mockResolvedValueOnce({ data: samplePollWithOptions, error: null });

    renderDetail();
    expect(
      await screen.findByRole('heading', { name: /Quel objectif climat/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/−40% CO2/)).toBeInTheDocument();
    expect(screen.getByText(/−60% CO2/)).toBeInTheDocument();
  });

  it('utilisateur anonyme : lien « Se connecter pour voter » sans appel à votePoll', async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    useAuthStore.setState({ status: 'anonymous', user: null, session: null });
    pollsMocks.getPoll.mockResolvedValueOnce({ data: samplePollWithOptions, error: null });

    renderDetail();
    expect(
      await screen.findByRole('link', { name: /Se connecter pour voter/i }),
    ).toBeInTheDocument();
    expect(pollsMocks.votePoll).not.toHaveBeenCalled();
  });

  it('user authentifié : sélection option + clic valider → votePoll + refresh', async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
    useAuthStore.setState({
      status: 'authenticated',
      user: fakeSession.user as never,
      session: fakeSession as never,
    });
    pollsMocks.getPoll
      .mockResolvedValueOnce({ data: samplePollWithOptions, error: null })
      .mockResolvedValueOnce({
        data: {
          poll: samplePoll,
          options: [
            { ...sampleOptions[0]!, vote_count: 10 },
            { ...sampleOptions[1]!, vote_count: 26 },
          ],
        },
        error: null,
      });
    pollsMocks.getUserVote
      .mockResolvedValueOnce({ optionId: null, error: null })
      .mockResolvedValueOnce({ optionId: 'o2', error: null });
    pollsMocks.votePoll.mockResolvedValueOnce({ data: { id: 'v1' }, error: null });

    renderDetail();
    const optionButton = await screen.findByRole('button', { name: /−60% CO2/i });
    await act(async () => {
      fireEvent.click(optionButton);
    });
    const validateBtn = screen.getByRole('button', { name: /Valider mon vote/i });
    await act(async () => {
      fireEvent.click(validateBtn);
    });
    await waitFor(() => expect(pollsMocks.votePoll).toHaveBeenCalledWith('p1', 'o2', 'u1'));
    // Après refresh, barres de progression visibles (compteurs affichés).
    expect(
      await screen.findByRole('button', { name: /Vote enregistré — retirer mon vote/i }),
    ).toBeInTheDocument();
  });

  it('user déjà votant : clic sur CTA appelle unvotePoll', async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
    useAuthStore.setState({
      status: 'authenticated',
      user: fakeSession.user as never,
      session: fakeSession as never,
    });
    pollsMocks.getPoll.mockResolvedValue({ data: samplePollWithOptions, error: null });
    pollsMocks.getUserVote
      .mockResolvedValueOnce({ optionId: 'o2', error: null })
      .mockResolvedValueOnce({ optionId: null, error: null });
    pollsMocks.unvotePoll.mockResolvedValueOnce({ error: null });

    renderDetail();
    const btn = await screen.findByRole('button', {
      name: /Vote enregistré — retirer mon vote/i,
    });
    await act(async () => {
      fireEvent.click(btn);
    });
    await waitFor(() => expect(pollsMocks.unvotePoll).toHaveBeenCalledWith('p1', 'u1'));
  });

  it('redirige vers /polls si le sondage est introuvable', async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    useAuthStore.setState({ status: 'anonymous', user: null, session: null });
    pollsMocks.getPoll.mockResolvedValueOnce({ data: null, error: null });

    renderDetail();
    expect(await screen.findByTestId('listing')).toBeInTheDocument();
  });
});
