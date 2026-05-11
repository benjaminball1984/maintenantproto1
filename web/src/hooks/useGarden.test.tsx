import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as GardenModule from '@/lib/garden';

const mocks = vi.hoisted(() => ({
  listGarden: vi.fn(),
}));

vi.mock('@/lib/garden', async () => {
  const actual = await vi.importActual<typeof GardenModule>('@/lib/garden');
  return {
    ...actual,
    listGarden: mocks.listGarden,
  };
});

import { useGarden } from '@/hooks/useGarden';
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

function Probe() {
  const { gardens, status } = useGarden();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="count">{gardens.length}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.listGarden.mockReset();
});

describe('useGarden', () => {
  it('charge la liste et passe en status=ready', async () => {
    mocks.listGarden.mockResolvedValueOnce({ data: [sample], error: null });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('passe en status=error sur erreur', async () => {
    mocks.listGarden.mockResolvedValueOnce({
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
  });
});
