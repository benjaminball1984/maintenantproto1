import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as CarpoolingModule from '@/lib/carpooling';

const mocks = vi.hoisted(() => ({
  listCarpooling: vi.fn(),
}));

vi.mock('@/lib/carpooling', async () => {
  const actual = await vi.importActual<typeof CarpoolingModule>('@/lib/carpooling');
  return {
    ...actual,
    listCarpooling: mocks.listCarpooling,
  };
});

import { useCarpooling } from '@/hooks/useCarpooling';
import type { CarpoolingRow } from '@/lib/carpooling';

const sample: CarpoolingRow = {
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
};

function Probe({ from }: { from?: string }) {
  const { carpooling, status, error } = useCarpooling({ from });
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="count">{carpooling.length}</span>
      <span data-testid="error">{error?.code ?? 'none'}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.listCarpooling.mockReset();
});

describe('useCarpooling', () => {
  it('charge la liste au mount et passe en status=ready', async () => {
    mocks.listCarpooling.mockResolvedValueOnce({ data: [sample], error: null });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('passe en status=error quand listCarpooling remonte une erreur', async () => {
    mocks.listCarpooling.mockResolvedValueOnce({
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

  it('relance la requête quand from change', async () => {
    mocks.listCarpooling.mockResolvedValueOnce({ data: [sample], error: null });
    const { rerender } = render(<Probe from="paris" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(mocks.listCarpooling).toHaveBeenLastCalledWith(
      expect.objectContaining({ from: 'paris' }),
    );

    mocks.listCarpooling.mockResolvedValueOnce({ data: [], error: null });
    rerender(<Probe from="lyon" />);
    await waitFor(() =>
      expect(mocks.listCarpooling).toHaveBeenLastCalledWith(
        expect.objectContaining({ from: 'lyon' }),
      ),
    );
  });
});
