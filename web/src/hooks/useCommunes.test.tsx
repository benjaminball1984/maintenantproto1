import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as CommunesModule from '@/lib/communes';

const mocks = vi.hoisted(() => ({
  listCommunes: vi.fn(),
}));

vi.mock('@/lib/communes', async () => {
  const actual = await vi.importActual<typeof CommunesModule>('@/lib/communes');
  return {
    ...actual,
    listCommunes: mocks.listCommunes,
  };
});

import { useCommunes } from '@/hooks/useCommunes';
import type { CommuneRow } from '@/lib/communes';

const sample: CommuneRow = {
  id: 'co1',
  name: 'Commune des Lilas',
  slug: 'commune-des-lilas',
  city: 'Les Lilas',
  description: null,
  treasurer_id: null,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

function Probe() {
  const { communes, status } = useCommunes();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="count">{communes.length}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.listCommunes.mockReset();
});

describe('useCommunes', () => {
  it('charge la liste et passe en status=ready', async () => {
    mocks.listCommunes.mockResolvedValueOnce({ data: [sample], error: null });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('passe en status=error sur erreur', async () => {
    mocks.listCommunes.mockResolvedValueOnce({
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

  it('renvoie liste vide quand aucune commune', async () => {
    mocks.listCommunes.mockResolvedValueOnce({ data: [], error: null });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('count').textContent).toBe('0');
  });
});
