import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as MarketplaceModule from '@/lib/marketplace';

const marketMocks = vi.hoisted(() => ({
  getMarketplaceItem: vi.fn(),
}));

vi.mock('@/lib/marketplace', async () => {
  const actual = await vi.importActual<typeof MarketplaceModule>('@/lib/marketplace');
  return {
    ...actual,
    getMarketplaceItem: marketMocks.getMarketplaceItem,
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
import MarketplaceDetailPage from './MarketplaceDetailPage';

const sample: MarketplaceItemRow = {
  id: 'm1',
  seller_id: 'u1',
  title: 'Vélo cargo',
  description: 'État neuf',
  category: 'Vélo',
  city: 'Paris',
  price_eur: 250,
  t99cp_cost: null,
  is_sold: false,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/services/marketplace/m1']}>
      <Routes>
        <Route path="/services/marketplace/:id" element={<MarketplaceDetailPage />} />
        <Route path="/services/marketplace" element={<div data-testid="listing">Listing</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  marketMocks.getMarketplaceItem.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('MarketplaceDetailPage', () => {
  it('rend l’annonce avec titre, ville, prix et description', async () => {
    marketMocks.getMarketplaceItem.mockResolvedValueOnce({ data: sample, error: null });
    renderDetail();
    expect(
      await screen.findByRole('heading', { name: /Vélo cargo/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/État neuf/)).toBeInTheDocument();
    expect(screen.getByText(/250 €/)).toBeInTheDocument();
  });

  it('redirige vers le listing si introuvable', async () => {
    marketMocks.getMarketplaceItem.mockResolvedValueOnce({ data: null, error: null });
    renderDetail();
    expect(await screen.findByTestId('listing')).toBeInTheDocument();
  });

  it('affiche le badge « Annonce clôturée » si is_sold', async () => {
    marketMocks.getMarketplaceItem.mockResolvedValueOnce({
      data: { ...sample, is_sold: true },
      error: null,
    });
    renderDetail();
    expect(await screen.findByText(/Annonce clôturée/i)).toBeInTheDocument();
  });
});
