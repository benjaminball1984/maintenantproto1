import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as CommunesModule from '@/lib/communes';

const communeMocks = vi.hoisted(() => ({
  getCommuneBySlug: vi.fn(),
  listCommuneMembers: vi.fn(),
  joinCommune: vi.fn(),
  leaveCommune: vi.fn(),
}));

vi.mock('@/lib/communes', async () => {
  const actual = await vi.importActual<typeof CommunesModule>('@/lib/communes');
  return {
    ...actual,
    getCommuneBySlug: communeMocks.getCommuneBySlug,
    listCommuneMembers: communeMocks.listCommuneMembers,
    joinCommune: communeMocks.joinCommune,
    leaveCommune: communeMocks.leaveCommune,
  };
});

const authMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi
    .fn()
    .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: authMocks },
}));

import { useAuthStore } from '@/lib/auth';
import type { CommuneMemberRow, CommuneRow } from '@/lib/communes';
import CommuneDetailPage from './CommuneDetailPage';

const sample: CommuneRow = {
  id: 'co1',
  name: 'Commune des Lilas',
  slug: 'commune-des-lilas',
  city: 'Les Lilas',
  description: 'Une commune libre.',
  treasurer_id: null,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

const memberOther: CommuneMemberRow = {
  id: 'cm1',
  commune_id: 'co1',
  user_id: 'u-other',
  role: 'member',
  joined_at: '2026-05-02T00:00:00Z',
};

function renderPage(initialPath = '/communes/commune-des-lilas') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/communes/:slug" element={<CommuneDetailPage />} />
        <Route path="/communes" element={<div data-testid="listing">LISTING</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('CommuneDetailPage', () => {
  it('rend la fiche avec city/description', async () => {
    communeMocks.getCommuneBySlug.mockResolvedValueOnce({ data: sample, error: null });
    communeMocks.listCommuneMembers.mockResolvedValueOnce({ data: [memberOther], error: null });
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: sample.name })).toBeInTheDocument(),
    );
    expect(screen.getByText(sample.description ?? '')).toBeInTheDocument();
    expect(screen.getByText(/1 membre/i)).toBeInTheDocument();
  });

  it('affiche un fallback "introuvable" pour un slug inconnu', async () => {
    communeMocks.getCommuneBySlug.mockResolvedValueOnce({ data: null, error: null });
    renderPage('/communes/inconnue');
    await waitFor(() =>
      expect(screen.getByText(/Commune introuvable/i)).toBeInTheDocument(),
    );
  });

  it('affiche un bouton "Se connecter" quand anonymous', async () => {
    communeMocks.getCommuneBySlug.mockResolvedValueOnce({ data: sample, error: null });
    communeMocks.listCommuneMembers.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Se connecter pour rejoindre/i)).toBeInTheDocument(),
    );
  });

  it('affiche "Rejoindre" quand authentifié non-membre', async () => {
    const fakeSession = {
      access_token: 't',
      user: { id: 'u1', email: 'a@x.org', user_metadata: {} },
    };
    authMocks.getSession.mockResolvedValue({
      data: { session: fakeSession },
      error: null,
    });
    useAuthStore.setState({
      status: 'authenticated',
      user: { id: 'u1', email: 'a@x.org', user_metadata: {} } as never,
      session: fakeSession as never,
    });
    communeMocks.getCommuneBySlug.mockResolvedValueOnce({ data: sample, error: null });
    communeMocks.listCommuneMembers.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Rejoindre cette commune/i }),
      ).toBeInTheDocument(),
    );
  });

  it('rend la liste des membres avec leur rôle', async () => {
    communeMocks.getCommuneBySlug.mockResolvedValueOnce({ data: sample, error: null });
    communeMocks.listCommuneMembers.mockResolvedValueOnce({ data: [memberOther], error: null });
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: sample.name })).toBeInTheDocument(),
    );
    // Plusieurs `role="list"` désormais sur la page (breadcrumb + membres) ;
    // on cible explicitement la liste membres par aria-label / fallback testid.
    const lists = screen.getAllByRole('list');
    const memberList = lists.find((l) => l.textContent?.includes('Membre')) ?? lists[0];
    expect(memberList).toBeDefined();
    expect(memberList?.textContent ?? '').toMatch(/Membre/);
  });

  it('affiche "Quitter" quand l’utilisateur est déjà membre', async () => {
    const fakeSession = {
      access_token: 't',
      user: { id: 'u-other', email: 'a@x.org', user_metadata: {} },
    };
    authMocks.getSession.mockResolvedValue({
      data: { session: fakeSession },
      error: null,
    });
    useAuthStore.setState({
      status: 'authenticated',
      user: { id: 'u-other', email: 'a@x.org', user_metadata: {} } as never,
      session: fakeSession as never,
    });
    communeMocks.getCommuneBySlug.mockResolvedValueOnce({ data: sample, error: null });
    communeMocks.listCommuneMembers.mockResolvedValueOnce({
      data: [memberOther],
      error: null,
    });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Quitter cette commune/i)).toBeInTheDocument(),
    );
  });
});
