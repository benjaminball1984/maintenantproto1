import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as GardenModule from '@/lib/garden';

const gardenMocks = vi.hoisted(() => ({
  createGarden: vi.fn(),
}));

vi.mock('@/lib/garden', async () => {
  const actual = await vi.importActual<typeof GardenModule>('@/lib/garden');
  return {
    ...actual,
    createGarden: gardenMocks.createGarden,
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
import GardenCreatePage from './GardenCreatePage';

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
    <MemoryRouter initialEntries={['/services/garden/new']}>
      <Routes>
        <Route path="/services/garden/new" element={<GardenCreatePage />} />
        <Route path="/services/garden/:id" element={<div data-testid="detail">Detail</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  gardenMocks.createGarden.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
  useAuthStore.setState({
    status: 'authenticated',
    user: fakeSession.user as never,
    session: fakeSession as never,
  });
});

describe('GardenCreatePage', () => {
  it('rend le formulaire', async () => {
    renderCreate();
    expect(
      await screen.findByRole('heading', { name: /Référencer un jardin partagé/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Nom du jardin/i)).toBeInTheDocument();
  });

  it('soumission avec champs vides : affiche les erreurs', async () => {
    renderCreate();
    const submit = await screen.findByRole('button', { name: /Référencer le jardin/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    expect(screen.getByText(/Le nom doit faire entre/i)).toBeInTheDocument();
    expect(gardenMocks.createGarden).not.toHaveBeenCalled();
  });

  it('soumission valide : redirige vers la fiche', async () => {
    gardenMocks.createGarden.mockResolvedValueOnce({
      data: {
        id: 'g1',
        manager_id: 'u1',
        name: 'Jardin de la République',
        description: null,
        city: 'Cherbourg',
        size_sqm: null,
        available_spots: 4,
        created_at: '2026-05-01T00:00:00Z',
        updated_at: '2026-05-01T00:00:00Z',
      },
      error: null,
    });
    renderCreate();

    fireEvent.change(await screen.findByLabelText(/Nom du jardin/i), {
      target: { value: 'Jardin de la République' },
    });
    fireEvent.change(screen.getByLabelText(/^Ville$/i), {
      target: { value: 'Cherbourg' },
    });
    fireEvent.change(screen.getByLabelText(/Parcelles libres/i), {
      target: { value: '4' },
    });

    const submit = screen.getByRole('button', { name: /Référencer le jardin/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    await waitFor(() => expect(gardenMocks.createGarden).toHaveBeenCalled());
    expect(await screen.findByTestId('detail')).toBeInTheDocument();
  });
});
