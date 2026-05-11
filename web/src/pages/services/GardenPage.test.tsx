import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type * as GardenModule from '@/lib/garden';

const gardenMocks = vi.hoisted(() => ({
  listGarden: vi.fn(),
}));

vi.mock('@/lib/garden', async () => {
  const actual = await vi.importActual<typeof GardenModule>('@/lib/garden');
  return {
    ...actual,
    listGarden: gardenMocks.listGarden,
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
import GardenPage from './GardenPage';

const sample = (overrides: Partial<GardenPlotRow> = {}): GardenPlotRow => ({
  id: 'g1',
  manager_id: 'u1',
  name: 'Jardin de la République',
  description: null,
  city: 'Cherbourg',
  size_sqm: 200,
  available_spots: 4,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
  ...overrides,
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/services/garden']}>
      <GardenPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  gardenMocks.listGarden.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('GardenPage', () => {
  it('rend le listing avec compteur', async () => {
    gardenMocks.listGarden.mockResolvedValueOnce({
      data: [sample(), sample({ id: 'g2', name: 'Jardin du parc' })],
      error: null,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
    expect(screen.getByText(/2 jardins/i)).toBeInTheDocument();
  });

  it('affiche les parcelles libres', async () => {
    gardenMocks.listGarden.mockResolvedValueOnce({
      data: [sample({ available_spots: 7 })],
      error: null,
    });
    renderPage();
    expect(await screen.findByText(/7 parcelles libres/i)).toBeInTheDocument();
  });

  it('affiche l’état vide quand aucun jardin', async () => {
    gardenMocks.listGarden.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    expect(await screen.findByText(/Aucun jardin référencé/i)).toBeInTheDocument();
  });
});
