import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as HousingModule from '@/lib/housing';

const housingMocks = vi.hoisted(() => ({
  getHousing: vi.fn(),
}));

vi.mock('@/lib/housing', async () => {
  const actual = await vi.importActual<typeof HousingModule>('@/lib/housing');
  return {
    ...actual,
    getHousing: housingMocks.getHousing,
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
import HousingDetailPage from './HousingDetailPage';

const sample: HousingRow = {
  id: 'h1',
  host_id: 'u1',
  title: 'Chambre Cherbourg',
  description: 'Belle chambre dans le centre-ville.',
  city: 'Cherbourg',
  capacity: 2,
  available_from: '2026-06-01',
  available_to: '2026-07-15',
  is_published: true,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

function renderDetail(id = 'h1') {
  return render(
    <MemoryRouter initialEntries={[`/services/housing/${id}`]}>
      <Routes>
        <Route path="/services/housing/:id" element={<HousingDetailPage />} />
        <Route path="/services/housing" element={<div data-testid="listing">Listing</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  housingMocks.getHousing.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('HousingDetailPage', () => {
  it('rend la fiche avec titre, ville, capacité', async () => {
    housingMocks.getHousing.mockResolvedValueOnce({ data: sample, error: null });
    renderDetail();
    expect(
      await screen.findByRole('heading', { name: /Chambre Cherbourg/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Cherbourg/).length).toBeGreaterThan(0);
    expect(screen.getByText(/2 places/i)).toBeInTheDocument();
  });

  it('expose le bouton « Faire une demande » pour un non-hôte', async () => {
    housingMocks.getHousing.mockResolvedValueOnce({ data: sample, error: null });
    renderDetail();
    const link = await screen.findByRole('link', { name: /Faire une demande/i });
    expect(link).toHaveAttribute('href', '/services/housing/h1/request');
  });

  it('masque le CTA quand l’utilisateur est l’hôte', async () => {
    authMocks.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'u1' },
          access_token: 'tok',
        },
      },
      error: null,
    });
    useAuthStore.setState({
      status: 'authenticated',
      user: { id: 'u1' } as never,
      session: null,
    });
    housingMocks.getHousing.mockResolvedValueOnce({ data: sample, error: null });
    renderDetail();
    expect(await screen.findByText(/Vous êtes l’hôte/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Faire une demande/i })).not.toBeInTheDocument();
  });

  it('redirige vers le listing si introuvable', async () => {
    housingMocks.getHousing.mockResolvedValueOnce({ data: null, error: null });
    renderDetail();
    expect(await screen.findByTestId('listing')).toBeInTheDocument();
  });

  it('expose un bouton Partager', async () => {
    housingMocks.getHousing.mockResolvedValueOnce({ data: sample, error: null });
    renderDetail();
    expect(await screen.findByRole('button', { name: /Partager/i })).toBeInTheDocument();
  });
});
