import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as LendingModule from '@/lib/lending';

const mocks = vi.hoisted(() => ({
  listLending: vi.fn(),
}));

vi.mock('@/lib/lending', async () => {
  const actual = await vi.importActual<typeof LendingModule>('@/lib/lending');
  return {
    ...actual,
    listLending: mocks.listLending,
  };
});

import { useLending } from '@/hooks/useLending';
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

function Probe({ city }: { city?: string }) {
  const { lending, status, error } = useLending({ city });
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="count">{lending.length}</span>
      <span data-testid="error">{error?.code ?? 'none'}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.listLending.mockReset();
});

describe('useLending', () => {
  it('charge la liste au mount et passe en status=ready', async () => {
    mocks.listLending.mockResolvedValueOnce({ data: [sample], error: null });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('passe en status=error sur erreur Postgrest', async () => {
    mocks.listLending.mockResolvedValueOnce({
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

  it('relance la requête quand city change', async () => {
    mocks.listLending.mockResolvedValueOnce({ data: [sample], error: null });
    const { rerender } = render(<Probe city="paris" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(mocks.listLending).toHaveBeenLastCalledWith(expect.objectContaining({ city: 'paris' }));

    mocks.listLending.mockResolvedValueOnce({ data: [], error: null });
    rerender(<Probe city="lyon" />);
    await waitFor(() =>
      expect(mocks.listLending).toHaveBeenLastCalledWith(expect.objectContaining({ city: 'lyon' })),
    );
  });
});
