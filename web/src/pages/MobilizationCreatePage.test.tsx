import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as MobilizationsModule from '@/lib/mobilizations';

const mobilizationsMocks = vi.hoisted(() => ({
  createMobilization: vi.fn(),
}));

vi.mock('@/lib/mobilizations', async () => {
  const actual = await vi.importActual<typeof MobilizationsModule>('@/lib/mobilizations');
  return {
    ...actual,
    createMobilization: mobilizationsMocks.createMobilization,
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
import { MOBILIZATION_SUMMARY_MIN } from '@/lib/mobilizations';
import MobilizationCreatePage from './MobilizationCreatePage';

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
    <MemoryRouter initialEntries={['/mobilizations/new']}>
      <Routes>
        <Route path="/mobilizations/new" element={<MobilizationCreatePage />} />
        <Route path="/mobilizations/:slug" element={<div data-testid="detail">Detail</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function fillValidForm() {
  fireEvent.change(screen.getByLabelText(/Titre de la mobilisation/i), {
    target: { value: 'Marche pour le climat — Paris' },
  });
  fireEvent.change(screen.getByLabelText(/Résumé court/i), {
    target: { value: 'a'.repeat(MOBILIZATION_SUMMARY_MIN) },
  });
  fireEvent.change(screen.getByLabelText(/^Ville$/i), { target: { value: 'Paris' } });
  fireEvent.change(screen.getByLabelText(/Date de début/i), {
    target: { value: '2030-06-01' },
  });
  fireEvent.change(screen.getByLabelText(/Heure de début/i), {
    target: { value: '14:00' },
  });
}

beforeEach(() => {
  mobilizationsMocks.createMobilization.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
  useAuthStore.setState({
    status: 'authenticated',
    user: fakeSession.user as never,
    session: fakeSession as never,
  });
});

describe('MobilizationCreatePage', () => {
  it('soumission avec champs vides : affiche les erreurs de validation FR', async () => {
    renderCreate();
    const submit = await screen.findByRole('button', { name: /Publier la mobilisation/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    expect(screen.getByText(/Le titre doit faire entre/i)).toBeInTheDocument();
    expect(screen.getByText(/Le résumé doit faire entre/i)).toBeInTheDocument();
    expect(screen.getByText(/La ville doit faire entre/i)).toBeInTheDocument();
    expect(screen.getByText(/Date de début invalide/i)).toBeInTheDocument();
    expect(mobilizationsMocks.createMobilization).not.toHaveBeenCalled();
  });

  it('soumission valide : appelle createMobilization et redirige vers la fiche', async () => {
    mobilizationsMocks.createMobilization.mockResolvedValueOnce({
      data: {
        id: 'm1',
        slug: 'marche-pour-le-climat-paris',
        organizer_id: 'u1',
        title: 'Marche pour le climat — Paris',
        summary: 'x',
        body: null,
        starts_at: '2030-06-01T14:00:00Z',
        ends_at: null,
        city: 'Paris',
        address: null,
        cover_url: null,
        status: 'published',
        participation_count: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      error: null,
    });
    renderCreate();
    fillValidForm();
    const submit = screen.getByRole('button', { name: /Publier la mobilisation/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    await waitFor(() => expect(mobilizationsMocks.createMobilization).toHaveBeenCalled());
    expect(await screen.findByTestId('detail')).toBeInTheDocument();
  });

  it('erreur Postgrest 42501 : affiche un message FR sans redirection', async () => {
    mobilizationsMocks.createMobilization.mockResolvedValueOnce({
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
    const submit = screen.getByRole('button', { name: /Publier la mobilisation/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    expect(
      await screen.findByText(/Vous n’avez pas les droits pour effectuer cette action/i),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('detail')).not.toBeInTheDocument();
  });
});
