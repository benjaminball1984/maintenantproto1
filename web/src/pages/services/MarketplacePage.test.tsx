import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type * as MarketplaceModule from '@/lib/marketplace';

const marketMocks = vi.hoisted(() => ({
  listMarketplace: vi.fn(),
}));

vi.mock('@/lib/marketplace', async () => {
  const actual = await vi.importActual<typeof MarketplaceModule>('@/lib/marketplace');
  return {
    ...actual,
    listMarketplace: marketMocks.listMarketplace,
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
import type { MarketplaceItemRow } from '@/lib/marketplace';
import MarketplacePage from './MarketplacePage';

const sample = (overrides: Partial<MarketplaceItemRow> = {}): MarketplaceItemRow => ({
  id: 'm1',
  seller_id: 'u1',
  title: 'Vélo cargo',
  description: null,
  category: 'Vélo',
  city: 'Paris',
  price_eur: 250,
  t99cp_cost: null,
  is_sold: false,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
  ...overrides,
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/services/marketplace']}>
      <MarketplacePage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  marketMocks.listMarketplace.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('MarketplacePage', () => {
  it('rend le listing avec compteur', async () => {
    marketMocks.listMarketplace.mockResolvedValueOnce({
      data: [sample(), sample({ id: 'm2', title: 'Tente 4 places' })],
      error: null,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
    expect(screen.getByText(/2 annonces/i)).toBeInTheDocument();
  });

  it('affiche le prix en T99CP si pas de prix euros', async () => {
    marketMocks.listMarketplace.mockResolvedValueOnce({
      data: [sample({ price_eur: null, t99cp_cost: 30 })],
      error: null,
    });
    renderPage();
    expect(await screen.findByText(/30 T99CP/i)).toBeInTheDocument();
  });

  it('affiche l’état vide quand aucune annonce', async () => {
    marketMocks.listMarketplace.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    expect(await screen.findByText(/Aucune annonce disponible/i)).toBeInTheDocument();
  });
});
