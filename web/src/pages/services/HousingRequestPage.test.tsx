import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as HousingModule from '@/lib/housing';

const housingMocks = vi.hoisted(() => ({
  getHousing: vi.fn(),
  requestHousing: vi.fn(),
}));

vi.mock('@/lib/housing', async () => {
  const actual = await vi.importActual<typeof HousingModule>('@/lib/housing');
  return {
    ...actual,
    getHousing: housingMocks.getHousing,
    requestHousing: housingMocks.requestHousing,
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
import type { HousingRow } from '@/lib/housing';
import HousingRequestPage from './HousingRequestPage';

const fakeSession = {
  access_token: 'a',
  refresh_token: 'r',
  expires_at: 0,
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'u2', email: 'me@x.org', user_metadata: {} },
};

const sample: HousingRow = {
  id: 'h1',
  host_id: 'u1',
  title: 'Chambre Cherbourg',
  description: 'Belle chambre dans le centre-ville.',
  city: 'Cherbourg',
  capacity: 2,
  available_from: null,
  available_to: null,
  is_published: true,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

function renderRequest() {
  return render(
    <MemoryRouter initialEntries={['/services/housing/h1/request']}>
      <Routes>
        <Route path="/services/housing/:id/request" element={<HousingRequestPage />} />
        <Route path="/services/housing/:id" element={<div data-testid="detail">Detail</div>} />
        <Route path="/services/housing" element={<div data-testid="listing">Listing</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  housingMocks.getHousing.mockReset();
  housingMocks.requestHousing.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
  useAuthStore.setState({
    status: 'authenticated',
    user: fakeSession.user as never,
    session: fakeSession as never,
  });
});

describe('HousingRequestPage', () => {
  it('rend le formulaire avec le résumé de l’annonce', async () => {
    housingMocks.getHousing.mockResolvedValueOnce({ data: sample, error: null });
    renderRequest();
    expect(
      await screen.findByRole('heading', { name: /Faire une demande/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Chambre Cherbourg/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message à l’hôte/i)).toBeInTheDocument();
  });

  it('redirige vers la fiche si l’utilisateur est l’hôte', async () => {
    authMocks.getSession.mockResolvedValue({
      data: { session: { ...fakeSession, user: { ...fakeSession.user, id: 'u1' } } },
      error: null,
    });
    useAuthStore.setState({
      status: 'authenticated',
      user: { id: 'u1' } as never,
      session: null,
    });
    housingMocks.getHousing.mockResolvedValueOnce({ data: sample, error: null });
    renderRequest();
    expect(await screen.findByTestId('detail')).toBeInTheDocument();
  });

  it('soumission avec champs vides : affiche les erreurs', async () => {
    housingMocks.getHousing.mockResolvedValueOnce({ data: sample, error: null });
    renderRequest();
    const submit = await screen.findByRole('button', { name: /Envoyer la demande/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    expect(screen.getByText(/Le message doit faire entre/i)).toBeInTheDocument();
    expect(housingMocks.requestHousing).not.toHaveBeenCalled();
  });

  it('soumission valide : affiche l’écran de confirmation', async () => {
    housingMocks.getHousing.mockResolvedValueOnce({ data: sample, error: null });
    housingMocks.requestHousing.mockResolvedValueOnce({
      data: {
        id: 'r1',
        housing_id: 'h1',
        requester_id: 'u2',
        message: 'm'.repeat(40),
        starts_on: '2026-06-10',
        ends_on: '2026-06-15',
        status: 'pending',
        created_at: '2026-05-01T00:00:00Z',
        updated_at: '2026-05-01T00:00:00Z',
      },
      error: null,
    });
    renderRequest();

    fireEvent.change(await screen.findByLabelText(/Message à l’hôte/i), {
      target: { value: 'm'.repeat(40) },
    });
    fireEvent.change(screen.getByLabelText(/Date d’arrivée/i), {
      target: { value: '2026-06-10' },
    });
    fireEvent.change(screen.getByLabelText(/Date de départ/i), {
      target: { value: '2026-06-15' },
    });

    const submit = screen.getByRole('button', { name: /Envoyer la demande/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    await waitFor(() => expect(housingMocks.requestHousing).toHaveBeenCalled());
    expect(await screen.findByText(/Demande envoyée/i)).toBeInTheDocument();
  });
});
