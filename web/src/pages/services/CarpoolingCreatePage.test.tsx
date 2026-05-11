import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as CarpoolingModule from '@/lib/carpooling';

const carpoolingMocks = vi.hoisted(() => ({
  createCarpooling: vi.fn(),
}));

vi.mock('@/lib/carpooling', async () => {
  const actual = await vi.importActual<typeof CarpoolingModule>('@/lib/carpooling');
  return {
    ...actual,
    createCarpooling: carpoolingMocks.createCarpooling,
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
import CarpoolingCreatePage from './CarpoolingCreatePage';

const fakeSession = {
  access_token: 'a',
  refresh_token: 'r',
  expires_at: 0,
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'u1', email: 'me@x.org', user_metadata: {} },
};

function futureDate(): string {
  const d = new Date(Date.now() + 1000 * 60 * 60 * 24 * 60);
  return d.toISOString().slice(0, 10);
}

function renderCreate() {
  return render(
    <MemoryRouter initialEntries={['/services/carpooling/new']}>
      <Routes>
        <Route path="/services/carpooling/new" element={<CarpoolingCreatePage />} />
        <Route
          path="/services/carpooling/:id"
          element={<div data-testid="detail">Detail</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  carpoolingMocks.createCarpooling.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
  useAuthStore.setState({
    status: 'authenticated',
    user: fakeSession.user as never,
    session: fakeSession as never,
  });
});

describe('CarpoolingCreatePage', () => {
  it('rend le formulaire complet', async () => {
    renderCreate();
    expect(
      await screen.findByRole('heading', { name: /Proposer un trajet/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Ville de départ/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ville d’arrivée/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Places disponibles/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tarif/i)).toBeInTheDocument();
  });

  it('soumission avec champs vides : affiche les erreurs', async () => {
    renderCreate();
    const submit = await screen.findByRole('button', { name: /Publier le trajet/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    expect(screen.getByText(/Le départ doit faire entre/i)).toBeInTheDocument();
    expect(carpoolingMocks.createCarpooling).not.toHaveBeenCalled();
  });

  it('soumission valide : redirige vers la fiche', async () => {
    carpoolingMocks.createCarpooling.mockResolvedValueOnce({
      data: {
        id: 'c1',
        driver_id: 'u1',
        origin_city: 'Paris',
        destination_city: 'Cherbourg',
        departs_at: '2026-06-15T08:00:00Z',
        seats: 3,
        price_eur: 12,
        notes: null,
        is_published: true,
        created_at: '2026-05-01T00:00:00Z',
        updated_at: '2026-05-01T00:00:00Z',
      },
      error: null,
    });
    renderCreate();

    fireEvent.change(await screen.findByLabelText(/Ville de départ/i), {
      target: { value: 'Paris' },
    });
    fireEvent.change(screen.getByLabelText(/Ville d’arrivée/i), {
      target: { value: 'Cherbourg' },
    });
    fireEvent.change(screen.getByLabelText(/Date de départ/i), {
      target: { value: futureDate() },
    });
    fireEvent.change(screen.getByLabelText(/Heure de départ/i), {
      target: { value: '08:00' },
    });
    fireEvent.change(screen.getByLabelText(/Places disponibles/i), {
      target: { value: '3' },
    });

    const submit = screen.getByRole('button', { name: /Publier le trajet/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    await waitFor(() => expect(carpoolingMocks.createCarpooling).toHaveBeenCalled());
    expect(await screen.findByTestId('detail')).toBeInTheDocument();
  });
});
