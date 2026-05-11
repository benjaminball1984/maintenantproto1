import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as CarpoolingModule from '@/lib/carpooling';

const mocks = vi.hoisted(() => ({
  getCarpooling: vi.fn(),
}));

vi.mock('@/lib/carpooling', async () => {
  const actual = await vi.importActual<typeof CarpoolingModule>('@/lib/carpooling');
  return {
    ...actual,
    getCarpooling: mocks.getCarpooling,
  };
});

import { useCarpoolingItem } from '@/hooks/useCarpoolingItem';
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

function Probe({ id }: { id: string | undefined }) {
  const { carpooling, status, error } = useCarpoolingItem(id);
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="origin">{carpooling?.origin_city ?? '-'}</span>
      <span data-testid="error">{error?.code ?? 'none'}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.getCarpooling.mockReset();
});

describe('useCarpoolingItem', () => {
  it('renvoie idle quand id est undefined', () => {
    render(<Probe id={undefined} />);
    expect(screen.getByTestId('status').textContent).toBe('idle');
  });

  it('charge le covoiturage et passe en status=ready', async () => {
    mocks.getCarpooling.mockResolvedValueOnce({ data: sample, error: null });
    render(<Probe id="c1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('origin').textContent).toBe('Paris');
  });

  it('passe en status=notfound si data: null', async () => {
    mocks.getCarpooling.mockResolvedValueOnce({ data: null, error: null });
    render(<Probe id="c1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('notfound'));
  });
});
