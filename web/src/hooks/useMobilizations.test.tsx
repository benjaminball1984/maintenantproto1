import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as MobilizationsModule from '@/lib/mobilizations';

const mocks = vi.hoisted(() => ({
  listMobilizations: vi.fn(),
}));

vi.mock('@/lib/mobilizations', async () => {
  const actual = await vi.importActual<typeof MobilizationsModule>('@/lib/mobilizations');
  return {
    ...actual,
    listMobilizations: mocks.listMobilizations,
  };
});

import { useMobilizations } from '@/hooks/useMobilizations';
import type { MobilizationRow } from '@/lib/mobilizations';

const sampleMobilization: MobilizationRow = {
  id: 'm1',
  organizer_id: 'u1',
  title: 'Marche pour le climat',
  slug: 'marche-pour-le-climat',
  summary: 'Une mobilisation pacifique',
  body: null,
  starts_at: '2026-06-01T14:00:00Z',
  ends_at: null,
  city: 'Paris',
  address: null,
  cover_url: null,
  status: 'published',
  participation_count: 42,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

function Probe({ search, city }: { search?: string; city?: string }) {
  const { mobilizations, status, error } = useMobilizations({ search, city });
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="count">{mobilizations.length}</span>
      <span data-testid="error">{error?.code ?? 'none'}</span>
      <ul>
        {mobilizations.map((m) => (
          <li key={m.id} data-testid="mobilization">
            {m.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

beforeEach(() => {
  mocks.listMobilizations.mockReset();
});

describe('useMobilizations', () => {
  it('charge la liste au mount et passe en status=ready', async () => {
    mocks.listMobilizations.mockResolvedValueOnce({ data: [sampleMobilization], error: null });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(mocks.listMobilizations).toHaveBeenCalledWith(
      expect.objectContaining({ search: undefined, city: undefined }),
    );
  });

  it('passe en status=error quand listMobilizations remonte une erreur', async () => {
    mocks.listMobilizations.mockResolvedValueOnce({
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
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('relance la requête quand search ou city change', async () => {
    mocks.listMobilizations.mockResolvedValueOnce({ data: [sampleMobilization], error: null });
    const { rerender } = render(<Probe search="climat" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(mocks.listMobilizations).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'climat' }),
    );

    mocks.listMobilizations.mockResolvedValueOnce({
      data: [{ ...sampleMobilization, id: 'm2', title: 'Autre' }],
      error: null,
    });
    rerender(<Probe search="climat" city="Paris" />);
    await waitFor(() =>
      expect(mocks.listMobilizations).toHaveBeenLastCalledWith(
        expect.objectContaining({ city: 'Paris', search: 'climat' }),
      ),
    );
  });
});
