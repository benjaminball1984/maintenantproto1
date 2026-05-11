import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as PetitionsModule from '@/lib/petitions';

const mocks = vi.hoisted(() => ({
  listPetitions: vi.fn(),
}));

vi.mock('@/lib/petitions', async () => {
  const actual = await vi.importActual<typeof PetitionsModule>('@/lib/petitions');
  return {
    ...actual,
    listPetitions: mocks.listPetitions,
  };
});

import { usePetitions } from '@/hooks/usePetitions';
import type { PetitionRow } from '@/lib/petitions';

const samplePetition: PetitionRow = {
  id: 'p1',
  author_id: 'u1',
  title: 'Sauvons la maternité',
  slug: 'sauvons-la-maternite',
  summary: 'Une cause locale',
  body: 'Body long',
  target_count: 5000,
  cover_url: null,
  category: 'Santé',
  status: 'published',
  signature_count: 120,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

function Probe({ search, category }: { search?: string; category?: string }) {
  const { petitions, status, error } = usePetitions({
    search,
    category,
  });
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="count">{petitions.length}</span>
      <span data-testid="error">{error?.code ?? 'none'}</span>
      <ul>
        {petitions.map((p) => (
          <li key={p.id} data-testid="petition">
            {p.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

beforeEach(() => {
  mocks.listPetitions.mockReset();
});

describe('usePetitions', () => {
  it('charge la liste au mount et passe en status=ready', async () => {
    mocks.listPetitions.mockResolvedValueOnce({ data: [samplePetition], error: null });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(mocks.listPetitions).toHaveBeenCalledWith(
      expect.objectContaining({ search: undefined, category: undefined }),
    );
  });

  it('passe en status=error quand listPetitions remonte une erreur', async () => {
    mocks.listPetitions.mockResolvedValueOnce({
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

  it('relance la requête quand search ou category change', async () => {
    mocks.listPetitions.mockResolvedValueOnce({ data: [samplePetition], error: null });
    const { rerender } = render(<Probe search="cherbourg" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(mocks.listPetitions).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'cherbourg' }),
    );

    mocks.listPetitions.mockResolvedValueOnce({
      data: [{ ...samplePetition, id: 'p2', title: 'Autre' }],
      error: null,
    });
    rerender(<Probe search="cherbourg" category="Santé" />);
    await waitFor(() =>
      expect(mocks.listPetitions).toHaveBeenLastCalledWith(
        expect.objectContaining({ category: 'Santé', search: 'cherbourg' }),
      ),
    );
  });
});
