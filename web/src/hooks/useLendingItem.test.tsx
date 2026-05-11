import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as LendingModule from '@/lib/lending';

const mocks = vi.hoisted(() => ({
  getLending: vi.fn(),
}));

vi.mock('@/lib/lending', async () => {
  const actual = await vi.importActual<typeof LendingModule>('@/lib/lending');
  return {
    ...actual,
    getLending: mocks.getLending,
  };
});

import { useLendingItem } from '@/hooks/useLendingItem';
import type { LendingRow } from '@/lib/lending';

const sample: LendingRow = {
  id: 'l1',
  owner_id: 'u1',
  title: 'Perceuse',
  description: null,
  category: 'Outillage',
  city: 'Paris',
  t99cp_cost: 5,
  is_available: true,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

function Probe({ id }: { id: string | undefined }) {
  const { lending, status, error } = useLendingItem(id);
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="title">{lending?.title ?? '-'}</span>
      <span data-testid="error">{error?.code ?? 'none'}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.getLending.mockReset();
});

describe('useLendingItem', () => {
  it('renvoie idle quand id est undefined', () => {
    render(<Probe id={undefined} />);
    expect(screen.getByTestId('status').textContent).toBe('idle');
  });

  it('charge l’annonce et passe en status=ready', async () => {
    mocks.getLending.mockResolvedValueOnce({ data: sample, error: null });
    render(<Probe id="l1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('title').textContent).toBe('Perceuse');
  });

  it('passe en status=notfound si data: null', async () => {
    mocks.getLending.mockResolvedValueOnce({ data: null, error: null });
    render(<Probe id="l1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('notfound'));
  });
});
