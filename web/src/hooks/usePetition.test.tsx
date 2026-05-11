import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import type * as PetitionsModule from '@/lib/petitions';

const mocks = vi.hoisted(() => ({
  getPetition: vi.fn(),
  hasUserSigned: vi.fn(),
}));

vi.mock('@/lib/petitions', async () => {
  const actual = await vi.importActual<typeof PetitionsModule>('@/lib/petitions');
  return {
    ...actual,
    getPetition: mocks.getPetition,
    hasUserSigned: mocks.hasUserSigned,
  };
});

import { usePetition } from '@/hooks/usePetition';
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

function Probe({ slug, userId }: { slug: string | undefined; userId: string | null }) {
  const { petition, status, signed, refresh } = usePetition(slug, userId);
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="title">{petition?.title ?? 'none'}</span>
      <span data-testid="count">{petition?.signature_count ?? 0}</span>
      <span data-testid="signed">{signed ? 'yes' : 'no'}</span>
      <button type="button" onClick={() => void refresh()}>
        refresh
      </button>
    </div>
  );
}

beforeEach(() => {
  mocks.getPetition.mockReset();
  mocks.hasUserSigned.mockReset();
});

describe('usePetition', () => {
  it('charge la pétition et reste signed=no si userId est null', async () => {
    mocks.getPetition.mockResolvedValueOnce({ data: samplePetition, error: null });
    render(<Probe slug="sauvons-la-maternite" userId={null} />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('title').textContent).toBe('Sauvons la maternité');
    expect(screen.getByTestId('signed').textContent).toBe('no');
    expect(mocks.hasUserSigned).not.toHaveBeenCalled();
  });

  it('renvoie status=notfound quand getPetition renvoie data: null', async () => {
    mocks.getPetition.mockResolvedValueOnce({ data: null, error: null });
    render(<Probe slug="unknown" userId={null} />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('notfound'));
  });

  it('charge signed=yes via hasUserSigned quand userId fourni', async () => {
    mocks.getPetition.mockResolvedValueOnce({ data: samplePetition, error: null });
    mocks.hasUserSigned.mockResolvedValueOnce({ signed: true, error: null });
    render(<Probe slug="sauvons-la-maternite" userId="u1" />);
    await waitFor(() => expect(screen.getByTestId('signed').textContent).toBe('yes'));
    expect(mocks.hasUserSigned).toHaveBeenCalledWith('p1', 'u1');
  });

  it('refresh relance getPetition et met à jour signature_count', async () => {
    mocks.getPetition.mockResolvedValueOnce({ data: samplePetition, error: null });
    mocks.hasUserSigned.mockResolvedValueOnce({ signed: false, error: null });
    render(<Probe slug="sauvons-la-maternite" userId="u1" />);
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('120'));

    mocks.getPetition.mockResolvedValueOnce({
      data: { ...samplePetition, signature_count: 121 },
      error: null,
    });
    mocks.hasUserSigned.mockResolvedValueOnce({ signed: true, error: null });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'refresh' }));
    });
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('121'));
    expect(screen.getByTestId('signed').textContent).toBe('yes');
  });
});
