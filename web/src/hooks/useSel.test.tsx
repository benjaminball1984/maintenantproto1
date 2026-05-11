import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as SelModule from '@/lib/sel';

const mocks = vi.hoisted(() => ({
  listSel: vi.fn(),
}));

vi.mock('@/lib/sel', async () => {
  const actual = await vi.importActual<typeof SelModule>('@/lib/sel');
  return {
    ...actual,
    listSel: mocks.listSel,
  };
});

import { useSel } from '@/hooks/useSel';
import type { SelOfferRow } from '@/lib/sel';

const sample: SelOfferRow = {
  id: 's1',
  user_id: 'u1',
  title: 'Cours de guitare',
  description: null,
  category: 'Musique',
  city: 'Paris',
  t99cp_rate: 5,
  is_active: true,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

function Probe() {
  const { offers, status } = useSel();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="count">{offers.length}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.listSel.mockReset();
});

describe('useSel', () => {
  it('charge la liste et passe en status=ready', async () => {
    mocks.listSel.mockResolvedValueOnce({ data: [sample], error: null });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('passe en status=error sur erreur', async () => {
    mocks.listSel.mockResolvedValueOnce({
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
