import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as MarketplaceModule from '@/lib/marketplace';

const mocks = vi.hoisted(() => ({
  listMarketplace: vi.fn(),
}));

vi.mock('@/lib/marketplace', async () => {
  const actual = await vi.importActual<typeof MarketplaceModule>('@/lib/marketplace');
  return {
    ...actual,
    listMarketplace: mocks.listMarketplace,
  };
});

import { useMarketplace } from '@/hooks/useMarketplace';
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

function Probe({ city }: { city?: string }) {
  const { items, status, error } = useMarketplace({ city });
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="count">{items.length}</span>
      <span data-testid="error">{error?.code ?? 'none'}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.listMarketplace.mockReset();
});

describe('useMarketplace', () => {
  it('charge la liste au mount et passe en status=ready', async () => {
    mocks.listMarketplace.mockResolvedValueOnce({ data: [sample], error: null });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('passe en status=error sur erreur Postgrest', async () => {
    mocks.listMarketplace.mockResolvedValueOnce({
      data: [],
      error: {
        message: 'denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('error'));
    expect(screen.getByTestId('error').textContent).toBe('42501');
  });
});
