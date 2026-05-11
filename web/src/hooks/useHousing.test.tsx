import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as HousingModule from '@/lib/housing';

const mocks = vi.hoisted(() => ({
  listHousing: vi.fn(),
}));

vi.mock('@/lib/housing', async () => {
  const actual = await vi.importActual<typeof HousingModule>('@/lib/housing');
  return {
    ...actual,
    listHousing: mocks.listHousing,
  };
});

import { useHousing } from '@/hooks/useHousing';
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

function Probe({ search }: { search?: string }) {
  const { housing, status, error } = useHousing({ search });
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="count">{housing.length}</span>
      <span data-testid="error">{error?.code ?? 'none'}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.listHousing.mockReset();
});

describe('useHousing', () => {
  it('charge la liste au mount et passe en status=ready', async () => {
    mocks.listHousing.mockResolvedValueOnce({ data: [sample], error: null });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('passe en status=error quand listHousing remonte une erreur', async () => {
    mocks.listHousing.mockResolvedValueOnce({
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

  it('relance la requête quand search change', async () => {
    mocks.listHousing.mockResolvedValueOnce({ data: [sample], error: null });
    const { rerender } = render(<Probe search="cherbourg" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(mocks.listHousing).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'cherbourg' }),
    );

    mocks.listHousing.mockResolvedValueOnce({ data: [], error: null });
    rerender(<Probe search="paris" />);
    await waitFor(() =>
      expect(mocks.listHousing).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'paris' }),
      ),
    );
  });
});
