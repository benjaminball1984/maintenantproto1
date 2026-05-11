import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as HousingModule from '@/lib/housing';

const housingMocks = vi.hoisted(() => ({
  createHousing: vi.fn(),
}));

vi.mock('@/lib/housing', async () => {
  const actual = await vi.importActual<typeof HousingModule>('@/lib/housing');
  return {
    ...actual,
    createHousing: housingMocks.createHousing,
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
import HousingCreatePage from './HousingCreatePage';

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
    <MemoryRouter initialEntries={['/services/housing/new']}>
      <Routes>
        <Route path="/services/housing/new" element={<HousingCreatePage />} />
        <Route path="/services/housing/:id" element={<div data-testid="detail">Detail</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  housingMocks.createHousing.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
  useAuthStore.setState({
    status: 'authenticated',
    user: fakeSession.user as never,
    session: fakeSession as never,
  });
});

describe('HousingCreatePage', () => {
  it('rend le formulaire complet', async () => {
    renderCreate();
    expect(
      await screen.findByRole('heading', { name: /Proposer un hébergement/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Titre de l’annonce/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Description$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ville/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Capacité/i)).toBeInTheDocument();
  });

  it('soumission avec champs vides : affiche les erreurs de validation FR', async () => {
    renderCreate();
    const submit = await screen.findByRole('button', { name: /Publier l’annonce/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    expect(screen.getByText(/Le titre doit faire entre/i)).toBeInTheDocument();
    expect(screen.getByText(/La description doit faire entre/i)).toBeInTheDocument();
    expect(housingMocks.createHousing).not.toHaveBeenCalled();
  });

  it('soumission valide : redirige vers la fiche', async () => {
    housingMocks.createHousing.mockResolvedValueOnce({
      data: {
        id: 'h1',
        host_id: 'u1',
        title: 'Chambre Cherbourg',
        description: 'd'.repeat(60),
        city: 'Cherbourg',
        capacity: 2,
        available_from: null,
        available_to: null,
        is_published: true,
        created_at: '2026-05-01T00:00:00Z',
        updated_at: '2026-05-01T00:00:00Z',
      },
      error: null,
    });
    renderCreate();

    fireEvent.change(await screen.findByLabelText(/Titre de l’annonce/i), {
      target: { value: 'Chambre Cherbourg' },
    });
    fireEvent.change(screen.getByLabelText(/^Description$/i), {
      target: { value: 'd'.repeat(60) },
    });
    fireEvent.change(screen.getByLabelText(/Ville/i), { target: { value: 'Cherbourg' } });
    fireEvent.change(screen.getByLabelText(/Capacité/i), { target: { value: '2' } });

    const submit = screen.getByRole('button', { name: /Publier l’annonce/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    await waitFor(() => expect(housingMocks.createHousing).toHaveBeenCalled());
    expect(await screen.findByTestId('detail')).toBeInTheDocument();
  });

  it('soumission valide en erreur RLS : affiche le message FR', async () => {
    housingMocks.createHousing.mockResolvedValueOnce({
      data: null,
      error: {
        message: 'denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    renderCreate();

    fireEvent.change(await screen.findByLabelText(/Titre de l’annonce/i), {
      target: { value: 'Chambre Cherbourg' },
    });
    fireEvent.change(screen.getByLabelText(/^Description$/i), {
      target: { value: 'd'.repeat(60) },
    });
    fireEvent.change(screen.getByLabelText(/Ville/i), { target: { value: 'Cherbourg' } });
    fireEvent.change(screen.getByLabelText(/Capacité/i), { target: { value: '2' } });

    const submit = screen.getByRole('button', { name: /Publier l’annonce/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    expect(
      await screen.findByText(/Vous n’avez pas les droits pour effectuer cette action/i),
    ).toBeInTheDocument();
  });
});
