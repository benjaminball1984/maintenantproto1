import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as SelModule from '@/lib/sel';

const mocks = vi.hoisted(() => ({
  getSelOffer: vi.fn(),
}));

vi.mock('@/lib/sel', async () => {
  const actual = await vi.importActual<typeof SelModule>('@/lib/sel');
  return {
    ...actual,
    getSelOffer: mocks.getSelOffer,
  };
});

import { useSelItem } from '@/hooks/useSelItem';
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

function Probe({ id }: { id: string | undefined }) {
  const { offer, status } = useSelItem(id);
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="title">{offer?.title ?? '-'}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.getSelOffer.mockReset();
});

describe('useSelItem', () => {
  it('renvoie idle quand id est undefined', () => {
    render(<Probe id={undefined} />);
    expect(screen.getByTestId('status').textContent).toBe('idle');
  });

  it('charge et passe en ready', async () => {
    mocks.getSelOffer.mockResolvedValueOnce({ data: sample, error: null });
    render(<Probe id="s1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('title').textContent).toBe('Cours de guitare');
  });

  it('passe en notfound si data: null', async () => {
    mocks.getSelOffer.mockResolvedValueOnce({ data: null, error: null });
    render(<Probe id="s1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('notfound'));
  });
});
