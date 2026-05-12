import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as CommunesModule from '@/lib/communes';

const mocks = vi.hoisted(() => ({
  getCommuneBySlug: vi.fn(),
  listCommuneMembers: vi.fn(),
}));

vi.mock('@/lib/communes', async () => {
  const actual = await vi.importActual<typeof CommunesModule>('@/lib/communes');
  return {
    ...actual,
    getCommuneBySlug: mocks.getCommuneBySlug,
    listCommuneMembers: mocks.listCommuneMembers,
  };
});

import { useCommune } from '@/hooks/useCommune';
import type { CommuneMemberRow, CommuneRow } from '@/lib/communes';

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

const member: CommuneMemberRow = {
  id: 'cm1',
  commune_id: 'co1',
  user_id: 'u2',
  role: 'member',
  joined_at: '2026-05-02T00:00:00Z',
};

function Probe({ slug }: { slug: string | undefined }) {
  const { commune, members, status } = useCommune(slug);
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="name">{commune?.name ?? ''}</span>
      <span data-testid="members">{members.length}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.getCommuneBySlug.mockReset();
  mocks.listCommuneMembers.mockReset();
});

describe('useCommune', () => {
  it('charge commune + membres et passe en ready', async () => {
    mocks.getCommuneBySlug.mockResolvedValueOnce({ data: sample, error: null });
    mocks.listCommuneMembers.mockResolvedValueOnce({ data: [member], error: null });
    render(<Probe slug="commune-des-lilas" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('name').textContent).toBe(sample.name);
    expect(screen.getByTestId('members').textContent).toBe('1');
  });

  it('passe en notfound si data null', async () => {
    mocks.getCommuneBySlug.mockResolvedValueOnce({ data: null, error: null });
    render(<Probe slug="absent" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('notfound'));
  });

  it('reste idle sans slug', () => {
    render(<Probe slug={undefined} />);
    expect(screen.getByTestId('status').textContent).toBe('idle');
  });

  it('passe en error si listCommuneMembers échoue', async () => {
    mocks.getCommuneBySlug.mockResolvedValueOnce({ data: sample, error: null });
    mocks.listCommuneMembers.mockResolvedValueOnce({
      data: [],
      error: {
        code: '42501',
        message: 'denied',
        details: '',
        hint: '',
        name: 'PostgrestError',
      },
    });
    render(<Probe slug="commune-des-lilas" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('error'));
  });
});
