import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type * as CommunesModule from '@/lib/communes';

const communeMocks = vi.hoisted(() => ({
  listCommunes: vi.fn(),
}));

vi.mock('@/lib/communes', async () => {
  const actual = await vi.importActual<typeof CommunesModule>('@/lib/communes');
  return {
    ...actual,
    listCommunes: communeMocks.listCommunes,
  };
});

const authMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi
    .fn()
    .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
}));

const rpcMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: authMocks, rpc: rpcMock },
}));

import { useAuthStore } from '@/lib/auth';
import type { CommuneRow } from '@/lib/communes';
import CommunesPage from './CommunesPage';

const sample: CommuneRow = {
  id: 'co1',
  name: 'Commune des Lilas',
  slug: 'commune-des-lilas',
  city: 'Les Lilas',
  description: 'Une commune libre engagée.',
  treasurer_id: null,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/communes']}>
      <CommunesPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('CommunesPage', () => {
  it('rend le listing avec compteur', async () => {
    communeMocks.listCommunes.mockResolvedValueOnce({ data: [sample], error: null });
    renderPage();
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(1));
    expect(screen.getByText(sample.name)).toBeInTheDocument();
    expect(screen.getByText(/1 commune/i)).toBeInTheDocument();
  });

  it('affiche l’état vide', async () => {
    communeMocks.listCommunes.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    expect(await screen.findByText(/Aucune commune publiée/i)).toBeInTheDocument();
  });

  it('masque le CTA "Créer une commune" pour un anonymous', async () => {
    communeMocks.listCommunes.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Aucune commune publiée/i)).toBeInTheDocument(),
    );
    expect(screen.queryByText(/Créer une commune/i)).toBeNull();
  });

  it('expose la recherche', async () => {
    communeMocks.listCommunes.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    await waitFor(() => expect(screen.getByRole('search')).toBeInTheDocument());
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('affiche le CTA "Créer une commune" pour un admin', async () => {
    const fakeSession = {
      access_token: 't',
      user: { id: 'u-admin', email: 'a@x.org', user_metadata: {} },
    };
    authMocks.getSession.mockResolvedValue({
      data: { session: fakeSession },
      error: null,
    });
    useAuthStore.setState({
      status: 'authenticated',
      user: { id: 'u-admin', email: 'a@x.org', user_metadata: {} } as never,
      session: fakeSession as never,
    });
    rpcMock.mockResolvedValueOnce({ data: true, error: null });
    communeMocks.listCommunes.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    await waitFor(() => expect(screen.getByText(/Créer une commune/i)).toBeInTheDocument());
  });
});
