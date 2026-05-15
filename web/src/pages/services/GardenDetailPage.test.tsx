import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { ToastProvider } from '@/components/Toast';
import type * as GardenModule from '@/lib/garden';

const gardenMocks = vi.hoisted(() => ({
  getGarden: vi.fn(),
}));

vi.mock('@/lib/garden', async () => {
  const actual = await vi.importActual<typeof GardenModule>('@/lib/garden');
  return {
    ...actual,
    getGarden: gardenMocks.getGarden,
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
import type { GardenPlotRow } from '@/lib/garden';
import GardenDetailPage from './GardenDetailPage';

const sample: GardenPlotRow = {
  id: 'g1',
  manager_id: 'u1',
  name: 'Jardin de la République',
  description: 'Permaculture',
  city: 'Cherbourg',
  size_sqm: 200,
  available_spots: 4,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/services/garden/g1']}>
      <ToastProvider>
        <Routes>
          <Route path="/services/garden/:id" element={<GardenDetailPage />} />
          <Route path="/services/garden" element={<div data-testid="listing">Listing</div>} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  gardenMocks.getGarden.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('GardenDetailPage', () => {
  it('rend le jardin avec nom, ville, surface, parcelles', async () => {
    gardenMocks.getGarden.mockResolvedValueOnce({ data: sample, error: null });
    renderDetail();
    expect(
      await screen.findByRole('heading', { name: /Jardin de la République/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Cherbourg/)).toBeInTheDocument();
    expect(screen.getByText(/200 m²/)).toBeInTheDocument();
    expect(screen.getByText(/4 parcelles libres/i)).toBeInTheDocument();
  });

  it('redirige vers le listing si introuvable', async () => {
    gardenMocks.getGarden.mockResolvedValueOnce({ data: null, error: null });
    renderDetail();
    expect(await screen.findByTestId('listing')).toBeInTheDocument();
  });
});
