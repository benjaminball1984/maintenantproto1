import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as PetitionsModule from '@/lib/petitions';

const petitionsMocks = vi.hoisted(() => ({
  createPetition: vi.fn(),
}));

vi.mock('@/lib/petitions', async () => {
  const actual = await vi.importActual<typeof PetitionsModule>('@/lib/petitions');
  return {
    ...actual,
    createPetition: petitionsMocks.createPetition,
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
import { PETITION_BODY_MIN, PETITION_SUMMARY_MIN } from '@/lib/petitions';
import PetitionCreatePage from './PetitionCreatePage';

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
    <MemoryRouter initialEntries={['/petitions/new']}>
      <Routes>
        <Route path="/petitions/new" element={<PetitionCreatePage />} />
        <Route path="/petitions/:slug" element={<div data-testid="detail">Detail</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function fillValidForm() {
  fireEvent.change(screen.getByLabelText(/Titre de la pétition/i), {
    target: { value: 'Sauvons la maternité de Cherbourg' },
  });
  fireEvent.change(screen.getByLabelText(/Résumé court/i), {
    target: { value: 'a'.repeat(PETITION_SUMMARY_MIN) },
  });
  fireEvent.change(screen.getByLabelText(/Présentation détaillée/i), {
    target: { value: 'b'.repeat(PETITION_BODY_MIN) },
  });
  fireEvent.change(screen.getByLabelText(/Objectif de signatures/i), {
    target: { value: '5000' },
  });
}

beforeEach(() => {
  petitionsMocks.createPetition.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
  useAuthStore.setState({
    status: 'authenticated',
    user: fakeSession.user as never,
    session: fakeSession as never,
  });
});

describe('PetitionCreatePage', () => {
  it('rend le formulaire complet (titre, catégorie, résumé, body, target, cover)', async () => {
    renderCreate();
    expect(
      await screen.findByRole('heading', { name: /Lancer une pétition/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Titre de la pétition/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Catégorie/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Résumé court/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Présentation détaillée/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Objectif de signatures/i)).toBeInTheDocument();
  });

  it('soumission avec champs vides : affiche les erreurs de validation FR', async () => {
    renderCreate();
    const submit = await screen.findByRole('button', { name: /Publier la pétition/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    expect(screen.getByText(/Le titre doit faire entre/i)).toBeInTheDocument();
    expect(screen.getByText(/Le résumé doit faire entre/i)).toBeInTheDocument();
    expect(petitionsMocks.createPetition).not.toHaveBeenCalled();
  });

  it('soumission valide : appelle createPetition et redirige vers la fiche', async () => {
    petitionsMocks.createPetition.mockResolvedValueOnce({
      data: {
        id: 'p1',
        slug: 'sauvons-la-maternite-de-cherbourg',
        author_id: 'u1',
        title: 'Sauvons la maternité de Cherbourg',
        summary: 'x',
        body: 'y',
        target_count: 5000,
        cover_url: null,
        category: 'Santé',
        status: 'published',
        signature_count: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      error: null,
    });
    renderCreate();
    fillValidForm();
    const submit = screen.getByRole('button', { name: /Publier la pétition/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    await waitFor(() => expect(petitionsMocks.createPetition).toHaveBeenCalled());
    expect(await screen.findByTestId('detail')).toBeInTheDocument();
  });

  it('erreur Postgrest 42501 : affiche un message FR sans redirection', async () => {
    petitionsMocks.createPetition.mockResolvedValueOnce({
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
    const submit = screen.getByRole('button', { name: /Publier la pétition/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    expect(
      await screen.findByText(/Vous n’avez pas les droits pour effectuer cette action/i),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('detail')).not.toBeInTheDocument();
  });
});
