import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as GardenModule from '@/lib/garden';

const mocks = vi.hoisted(() => ({
  getGarden: vi.fn(),
}));

vi.mock('@/lib/garden', async () => {
  const actual = await vi.importActual<typeof GardenModule>('@/lib/garden');
  return {
    ...actual,
    getGarden: mocks.getGarden,
  };
});

import { useGardenItem } from '@/hooks/useGardenItem';
import type { GardenPlotRow } from '@/lib/garden';

const sample: GardenPlotRow = {
  id: 'g1',
  manager_id: 'u1',
  name: 'Jardin',
  description: null,
  city: 'Paris',
  size_sqm: null,
  available_spots: 0,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

function Probe({ id }: { id: string | undefined }) {
  const { garden, status } = useGardenItem(id);
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="name">{garden?.name ?? '-'}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.getGarden.mockReset();
});

describe('useGardenItem', () => {
  it('renvoie idle quand id est undefined', () => {
    render(<Probe id={undefined} />);
    expect(screen.getByTestId('status').textContent).toBe('idle');
  });

  it('charge et passe en ready', async () => {
    mocks.getGarden.mockResolvedValueOnce({ data: sample, error: null });
    render(<Probe id="g1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('name').textContent).toBe('Jardin');
  });

  it('passe en notfound si data: null', async () => {
    mocks.getGarden.mockResolvedValueOnce({ data: null, error: null });
    render(<Probe id="g1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('notfound'));
  });
});
