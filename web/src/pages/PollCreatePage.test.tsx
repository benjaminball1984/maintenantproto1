import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as PollsModule from '@/lib/polls';

const pollsMocks = vi.hoisted(() => ({
  createPoll: vi.fn(),
}));

vi.mock('@/lib/polls', async () => {
  const actual = await vi.importActual<typeof PollsModule>('@/lib/polls');
  return {
    ...actual,
    createPoll: pollsMocks.createPoll,
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
import PollCreatePage from './PollCreatePage';

const fakeSession = {
  access_token: 'a',
  refresh_token: 'r',
  expires_at: 0,
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'u1', email: 'me@x.org', user_metadata: {} },
};

function renderCreate() {
  return render(
    <MemoryRouter initialEntries={['/polls/new']}>
      <Routes>
        <Route path="/polls/new" element={<PollCreatePage />} />
        <Route path="/polls/:slug" element={<div data-testid="detail">Detail</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function fillValidForm() {
  fireEvent.change(screen.getByLabelText(/Question$/i), {
    target: { value: 'Quel objectif climat pour la commune en 2026 ?' },
  });
  fireEvent.change(screen.getByLabelText(/Contexte/i), {
    target: { value: 'Une consultation interne pour fixer la trajectoire municipale.' },
  });
  fireEvent.change(screen.getByLabelText(/Option 1/i), {
    target: { value: '−40% net CO₂' },
  });
  fireEvent.change(screen.getByLabelText(/Option 2/i), {
    target: { value: '−60% net CO₂' },
  });
}

beforeEach(() => {
  pollsMocks.createPoll.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
  useAuthStore.setState({
    status: 'authenticated',
    user: fakeSession.user as never,
    session: fakeSession as never,
  });
});

describe('PollCreatePage', () => {
  it('rend le formulaire complet (question, description, options, clôture, adhérents)', async () => {
    renderCreate();
    expect(
      await screen.findByRole('heading', { name: /Lancer un sondage/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Question$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contexte/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Option 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Option 2/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Réservé aux adhérent·es/i)).toBeInTheDocument();
  });

  it('soumission avec champs vides : affiche les erreurs de validation FR', async () => {
    renderCreate();
    const submit = await screen.findByRole('button', { name: /Publier le sondage/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    expect(screen.getByText(/La question doit faire entre/i)).toBeInTheDocument();
    expect(screen.getByText(/La description doit faire entre/i)).toBeInTheDocument();
    expect(pollsMocks.createPoll).not.toHaveBeenCalled();
  });

  it('soumission valide : appelle createPoll et redirige vers la fiche', async () => {
    pollsMocks.createPoll.mockResolvedValueOnce({
      data: {
        poll: {
          id: 'p1',
          slug: 'climat-2026',
          author_id: 'u1',
          question: 'Quel objectif climat pour la commune en 2026 ?',
          description: 'X',
          members_only: true,
          closes_at: null,
          status: 'published',
          created_at: '2026-05-01T00:00:00Z',
          updated_at: '2026-05-01T00:00:00Z',
        },
        options: [],
      },
      error: null,
    });
    renderCreate();
    fillValidForm();
    const submit = screen.getByRole('button', { name: /Publier le sondage/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    await waitFor(() => expect(pollsMocks.createPoll).toHaveBeenCalled());
    expect(await screen.findByTestId('detail')).toBeInTheDocument();
  });

  it('erreur Postgrest 42501 : affiche un message FR sans redirection', async () => {
    pollsMocks.createPoll.mockResolvedValueOnce({
      data: null,
      error: {
        message: 'permission denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    renderCreate();
    fillValidForm();
    const submit = screen.getByRole('button', { name: /Publier le sondage/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    expect(
      await screen.findByText(/Vous n’avez pas les droits pour effectuer cette action/i),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('detail')).not.toBeInTheDocument();
  });
});
