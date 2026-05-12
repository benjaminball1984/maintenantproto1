import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type * as AdminModule from '@/lib/admin';

const adminMocks = vi.hoisted(() => ({
  listFlaggedArticles: vi.fn(),
  listFlaggedPosts: vi.fn(),
  listFlaggedPostComments: vi.fn(),
  listFlaggedComments: vi.fn(),
  listEmailCampaigns: vi.fn(),
}));

vi.mock('@/lib/admin', async () => {
  const actual = await vi.importActual<typeof AdminModule>('@/lib/admin');
  return {
    ...actual,
    listFlaggedArticles: adminMocks.listFlaggedArticles,
    listFlaggedPosts: adminMocks.listFlaggedPosts,
    listFlaggedPostComments: adminMocks.listFlaggedPostComments,
    listFlaggedComments: adminMocks.listFlaggedComments,
    listEmailCampaigns: adminMocks.listEmailCampaigns,
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
import AdminPage from './AdminPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <AdminPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
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
  rpcMock.mockResolvedValue({ data: true, error: null });
  adminMocks.listFlaggedArticles.mockResolvedValue({ data: [], error: null });
  adminMocks.listFlaggedPosts.mockResolvedValue({ data: [], error: null });
  adminMocks.listFlaggedPostComments.mockResolvedValue({ data: [], error: null });
  adminMocks.listFlaggedComments.mockResolvedValue({ data: [], error: null });
  adminMocks.listEmailCampaigns.mockResolvedValue({ data: [], error: null });
});

describe('AdminPage', () => {
  it('rend les onglets', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /Modération/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Communes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Email$/i })).toBeInTheDocument();
  });

  it('affiche le panneau modération par défaut', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/File de modération/i)).toBeInTheDocument(),
    );
  });

  it('bascule sur le panneau communes', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Communes/i }));
    expect(await screen.findByText(/Créer une commune/i)).toBeInTheDocument();
  });

  it('bascule sur le panneau email et affiche le formulaire', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /^Email$/i }));
    expect(await screen.findByLabelText(/Nouvelle campagne email/i)).toBeInTheDocument();
  });

  it('rend file vide quand aucun flagged', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Aucun contenu en attente de modération/i)).toBeInTheDocument(),
    );
  });

  it('affiche un item flagged avec actions', async () => {
    adminMocks.listFlaggedPosts.mockResolvedValueOnce({
      data: [
        {
          kind: 'post',
          id: 'p1',
          authorId: 'u2',
          body: 'Contenu signalé',
          createdAt: '2026-05-01T00:00:00Z',
        },
      ],
      error: null,
    });
    renderPage();
    await waitFor(() => expect(screen.getByText(/Contenu signalé/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Lever le flag/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Supprimer/i })).toBeInTheDocument();
  });

  it('affiche l’état vide des campagnes email', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /^Email$/i }));
    await waitFor(() =>
      expect(screen.getByText(/Aucune campagne/i)).toBeInTheDocument(),
    );
  });
});
