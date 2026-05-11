import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type * as CarpoolingModule from '@/lib/carpooling';

const carpoolingMocks = vi.hoisted(() => ({
  listCarpooling: vi.fn(),
}));

vi.mock('@/lib/carpooling', async () => {
  const actual = await vi.importActual<typeof CarpoolingModule>('@/lib/carpooling');
  return {
    ...actual,
    listCarpooling: carpoolingMocks.listCarpooling,
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
import type { CarpoolingRow } from '@/lib/carpooling';
import CarpoolingPage from './CarpoolingPage';

const sample = (overrides: Partial<CarpoolingRow> = {}): CarpoolingRow => ({
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
  ...overrides,
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/services/carpooling']}>
      <CarpoolingPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  carpoolingMocks.listCarpooling.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('CarpoolingPage', () => {
  it('rend le listing avec compteur', async () => {
    carpoolingMocks.listCarpooling.mockResolvedValueOnce({
      data: [sample(), sample({ id: 'c2', origin_city: 'Lyon' })],
      error: null,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
    expect(screen.getByText(/2 trajets/i)).toBeInTheDocument();
  });

  it('affiche un trajet gratuit avec le label « Gratuit »', async () => {
    carpoolingMocks.listCarpooling.mockResolvedValueOnce({
      data: [sample({ price_eur: 0 })],
      error: null,
    });
    renderPage();
    expect(await screen.findByText(/Gratuit/i)).toBeInTheDocument();
  });

  it('affiche l’état vide quand aucun trajet', async () => {
    carpoolingMocks.listCarpooling.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    expect(await screen.findByText(/Aucun covoiturage trouvé/i)).toBeInTheDocument();
  });

  it('affiche l’erreur Postgrest mappée en FR', async () => {
    carpoolingMocks.listCarpooling.mockResolvedValueOnce({
      data: [],
      error: {
        message: 'denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    renderPage();
    expect(
      await screen.findByText(/Vous n’avez pas les droits pour effectuer cette action/i),
    ).toBeInTheDocument();
  });
});
