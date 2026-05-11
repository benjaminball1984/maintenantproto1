import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import type * as MobilizationsModule from '@/lib/mobilizations';

const mocks = vi.hoisted(() => ({
  getMobilization: vi.fn(),
  hasUserRsvp: vi.fn(),
}));

vi.mock('@/lib/mobilizations', async () => {
  const actual = await vi.importActual<typeof MobilizationsModule>('@/lib/mobilizations');
  return {
    ...actual,
    getMobilization: mocks.getMobilization,
    hasUserRsvp: mocks.hasUserRsvp,
  };
});

import { useMobilization } from '@/hooks/useMobilization';
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

function Probe({ slug, userId }: { slug: string | undefined; userId: string | null }) {
  const { mobilization, status, rsvp, refresh } = useMobilization(slug, userId);
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="title">{mobilization?.title ?? 'none'}</span>
      <span data-testid="count">{mobilization?.participation_count ?? 0}</span>
      <span data-testid="rsvp">{rsvp ? 'yes' : 'no'}</span>
      <button type="button" onClick={() => void refresh()}>
        refresh
      </button>
    </div>
  );
}

beforeEach(() => {
  mocks.getMobilization.mockReset();
  mocks.hasUserRsvp.mockReset();
});

describe('useMobilization', () => {
  it('charge la mobilisation et reste rsvp=no si userId est null', async () => {
    mocks.getMobilization.mockResolvedValueOnce({ data: sampleMobilization, error: null });
    render(<Probe slug="marche-pour-le-climat" userId={null} />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('title').textContent).toBe('Marche pour le climat');
    expect(screen.getByTestId('rsvp').textContent).toBe('no');
    expect(mocks.hasUserRsvp).not.toHaveBeenCalled();
  });

  it('renvoie status=notfound quand getMobilization renvoie data: null', async () => {
    mocks.getMobilization.mockResolvedValueOnce({ data: null, error: null });
    render(<Probe slug="unknown" userId={null} />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('notfound'));
  });

  it('charge rsvp=yes via hasUserRsvp quand userId fourni', async () => {
    mocks.getMobilization.mockResolvedValueOnce({ data: sampleMobilization, error: null });
    mocks.hasUserRsvp.mockResolvedValueOnce({ rsvp: true, error: null });
    render(<Probe slug="marche-pour-le-climat" userId="u1" />);
    await waitFor(() => expect(screen.getByTestId('rsvp').textContent).toBe('yes'));
    expect(mocks.hasUserRsvp).toHaveBeenCalledWith('m1', 'u1');
  });

  it('refresh relance getMobilization et met à jour participation_count', async () => {
    mocks.getMobilization.mockResolvedValueOnce({ data: sampleMobilization, error: null });
    mocks.hasUserRsvp.mockResolvedValueOnce({ rsvp: false, error: null });
    render(<Probe slug="marche-pour-le-climat" userId="u1" />);
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('42'));

    mocks.getMobilization.mockResolvedValueOnce({
      data: { ...sampleMobilization, participation_count: 43 },
      error: null,
    });
    mocks.hasUserRsvp.mockResolvedValueOnce({ rsvp: true, error: null });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'refresh' }));
    });
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('43'));
    expect(screen.getByTestId('rsvp').textContent).toBe('yes');
  });
});
