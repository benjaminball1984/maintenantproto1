import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type * as PollsModule from '@/lib/polls';

const pollsMocks = vi.hoisted(() => ({
  listPolls: vi.fn(),
}));

vi.mock('@/lib/polls', async () => {
  const actual = await vi.importActual<typeof PollsModule>('@/lib/polls');
  return {
    ...actual,
    listPolls: pollsMocks.listPolls,
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
import type { PollRow } from '@/lib/polls';
import PollsPage from './PollsPage';

const samplePoll = (overrides: Partial<PollRow> = {}): PollRow => ({
  id: 'p1',
  author_id: 'u1',
  slug: 'climat-2026',
  question: 'Quel objectif climat pour la commune en 2026 ?',
  description: 'Une consultation interne au mouvement.',
  members_only: true,
  closes_at: null,
  status: 'published',
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
  ...overrides,
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/polls']}>
      <PollsPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  pollsMocks.listPolls.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('PollsPage', () => {
  it('rend le listing avec compteur de sondages', async () => {
    pollsMocks.listPolls.mockResolvedValueOnce({
      data: [samplePoll(), samplePoll({ id: 'p2', slug: 'p2', question: 'Autre sondage ?' })],
      error: null,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
    expect(
      screen.getByRole('heading', { name: /Quel objectif climat pour la commune/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/2 sondages/i)).toBeInTheDocument();
    expect(pollsMocks.listPolls).toHaveBeenCalled();
  });

  it('affiche l’état vide quand aucun sondage', async () => {
    pollsMocks.listPolls.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    expect(await screen.findByText(/Aucun sondage trouvé/i)).toBeInTheDocument();
  });

  it('soumission de la recherche appelle listPolls avec search', async () => {
    pollsMocks.listPolls.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    await waitFor(() => expect(pollsMocks.listPolls).toHaveBeenCalledTimes(1));

    const input = screen.getByRole('searchbox', { name: /Rechercher un sondage/i });
    fireEvent.change(input, { target: { value: 'climat' } });
    pollsMocks.listPolls.mockResolvedValueOnce({ data: [], error: null });
    fireEvent.submit(input);

    await waitFor(() =>
      expect(pollsMocks.listPolls).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'climat' }),
      ),
    );
  });

  it('affiche l’erreur Postgrest mappée en FR', async () => {
    pollsMocks.listPolls.mockResolvedValueOnce({
      data: [],
      error: {
        message: 'denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    renderPage();
    expect(
      await screen.findByText(/Vous n’avez pas les droits pour effectuer cette action/i),
    ).toBeInTheDocument();
  });
});
