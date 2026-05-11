import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as HousingModule from '@/lib/housing';

const mocks = vi.hoisted(() => ({
  getHousing: vi.fn(),
}));

vi.mock('@/lib/housing', async () => {
  const actual = await vi.importActual<typeof HousingModule>('@/lib/housing');
  return {
    ...actual,
    getHousing: mocks.getHousing,
  };
});

import { useHousingItem } from '@/hooks/useHousingItem';
import type { HousingRow } from '@/lib/housing';

const sample: HousingRow = {
  id: 'h1',
  host_id: 'u1',
  title: 'Chambre Cherbourg',
  description: 'a'.repeat(60),
  city: 'Cherbourg',
  capacity: 2,
  available_from: null,
  available_to: null,
  is_published: true,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

function Probe({ id }: { id: string | undefined }) {
  const { housing, status, error } = useHousingItem(id);
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="title">{housing?.title ?? '-'}</span>
      <span data-testid="error">{error?.code ?? 'none'}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.getHousing.mockReset();
});

describe('useHousingItem', () => {
  it('renvoie idle quand id est undefined', () => {
    render(<Probe id={undefined} />);
    expect(screen.getByTestId('status').textContent).toBe('idle');
  });

  it('charge l’hébergement et passe en status=ready', async () => {
    mocks.getHousing.mockResolvedValueOnce({ data: sample, error: null });
    render(<Probe id="h1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('title').textContent).toBe('Chambre Cherbourg');
  });

  it('passe en status=notfound si data: null', async () => {
    mocks.getHousing.mockResolvedValueOnce({ data: null, error: null });
    render(<Probe id="h1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('notfound'));
  });
});
