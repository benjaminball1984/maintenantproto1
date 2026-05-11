import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import type * as MembershipModule from '@/lib/membership';

const mocks = vi.hoisted(() => ({
  getCurrentAdhesion: vi.fn(),
}));

vi.mock('@/lib/membership', async () => {
  const actual = await vi.importActual<typeof MembershipModule>('@/lib/membership');
  return {
    ...actual,
    getCurrentAdhesion: mocks.getCurrentAdhesion,
  };
});

import { useAdhesion } from '@/hooks/useAdhesion';

const sampleAdhesion = {
  id: 'a1',
  user_id: 'u1',
  tier: 'soutien' as const,
  status: 'active' as const,
  amount_eur: 5,
  stripe_subscription_id: 'sub_1',
  starts_on: '2026-01-01',
  ends_on: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

function Probe({ userId }: { userId: string | null }) {
  const { adhesion, status, error, refresh } = useAdhesion(userId);
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="tier">{adhesion?.tier ?? 'none'}</span>
      <span data-testid="error">{error?.code ?? 'none'}</span>
      <button type="button" onClick={() => void refresh()}>
        refresh
      </button>
    </div>
  );
}

beforeEach(() => {
  mocks.getCurrentAdhesion.mockReset();
});

describe('useAdhesion', () => {
  it('reste en status=idle quand userId est null (utilisateur anonyme)', async () => {
    render(<Probe userId={null} />);
    expect(screen.getByTestId('status').textContent).toBe('idle');
    expect(mocks.getCurrentAdhesion).not.toHaveBeenCalled();
  });

  it('charge l’adhésion au mount et expose tier=soutien', async () => {
    mocks.getCurrentAdhesion.mockResolvedValueOnce({ data: sampleAdhesion, error: null });
    render(<Probe userId="u1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('tier').textContent).toBe('soutien');
    expect(mocks.getCurrentAdhesion).toHaveBeenCalledWith('u1');
  });

  it('refresh relance la requête et met à jour le tier', async () => {
    mocks.getCurrentAdhesion.mockResolvedValueOnce({ data: sampleAdhesion, error: null });
    render(<Probe userId="u1" />);
    await waitFor(() => expect(screen.getByTestId('tier').textContent).toBe('soutien'));
    mocks.getCurrentAdhesion.mockResolvedValueOnce({
      data: { ...sampleAdhesion, tier: 'engage' },
      error: null,
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'refresh' }));
    });
    await waitFor(() => expect(screen.getByTestId('tier').textContent).toBe('engage'));
    expect(mocks.getCurrentAdhesion).toHaveBeenCalledTimes(2);
  });

  it('passe en status=error quand getCurrentAdhesion remonte un PostgrestError', async () => {
    mocks.getCurrentAdhesion.mockResolvedValueOnce({
      data: null,
      error: {
        message: 'denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    render(<Probe userId="u1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('error'));
    expect(screen.getByTestId('error').textContent).toBe('42501');
    expect(screen.getByTestId('tier').textContent).toBe('none');
  });
});
