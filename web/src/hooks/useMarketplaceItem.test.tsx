import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as MarketplaceModule from '@/lib/marketplace';

const mocks = vi.hoisted(() => ({
  getMarketplaceItem: vi.fn(),
}));

vi.mock('@/lib/marketplace', async () => {
  const actual = await vi.importActual<typeof MarketplaceModule>('@/lib/marketplace');
  return {
    ...actual,
    getMarketplaceItem: mocks.getMarketplaceItem,
  };
});

import { useMarketplaceItem } from '@/hooks/useMarketplaceItem';
import type { MarketplaceItemRow } from '@/lib/marketplace';

const sample: MarketplaceItemRow = {
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
};

function Probe({ id }: { id: string | undefined }) {
  const { item, status } = useMarketplaceItem(id);
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="title">{item?.title ?? '-'}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.getMarketplaceItem.mockReset();
});

describe('useMarketplaceItem', () => {
  it('renvoie idle quand id est undefined', () => {
    render(<Probe id={undefined} />);
    expect(screen.getByTestId('status').textContent).toBe('idle');
  });

  it('charge l’annonce et passe en status=ready', async () => {
    mocks.getMarketplaceItem.mockResolvedValueOnce({ data: sample, error: null });
    render(<Probe id="m1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('title').textContent).toBe('Vélo cargo');
  });

  it('passe en status=notfound si data: null', async () => {
    mocks.getMarketplaceItem.mockResolvedValueOnce({ data: null, error: null });
    render(<Probe id="m1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('notfound'));
  });
});
