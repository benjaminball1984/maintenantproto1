import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as CommunesModule from '@/lib/communes';
import type * as AdminModule from '@/lib/admin';

const communeMocks = vi.hoisted(() => ({
  createCommune: vi.fn(),
}));

const adminMocks = vi.hoisted(() => ({
  logAdminAction: vi.fn(),
}));

vi.mock('@/lib/communes', async () => {
  const actual = await vi.importActual<typeof CommunesModule>('@/lib/communes');
  return {
    ...actual,
    createCommune: communeMocks.createCommune,
  };
});

vi.mock('@/lib/admin', async () => {
  const actual = await vi.importActual<typeof AdminModule>('@/lib/admin');
  return {
    ...actual,
    logAdminAction: adminMocks.logAdminAction,
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
import CommuneCreatePage from './CommuneCreatePage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/communes/new']}>
      <Routes>
        <Route path="/communes/new" element={<CommuneCreatePage />} />
        <Route path="/communes/:slug" element={<div data-testid="detail">DETAIL</div>} />
      </Routes>
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
});

describe('CommuneCreatePage', () => {
  it('affiche le formulaire', () => {
    renderPage();
    expect(screen.getByLabelText(/Nom de la commune/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ville/i)).toBeInTheDocument();
    expect(screen.getByText(/Créer la commune/i)).toBeInTheDocument();
  });

  it('refuse un input invalide', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/Nom de la commune/i), {
      target: { value: 'x' },
    });
    fireEvent.change(screen.getByLabelText(/Ville/i), { target: { value: 'L' } });
    fireEvent.submit(screen.getByLabelText(/Création d'une commune/i));
    await waitFor(() => {
      expect(screen.getByText(/Le nom doit faire entre/i)).toBeInTheDocument();
    });
    expect(communeMocks.createCommune).not.toHaveBeenCalled();
  });

  it('crée une commune, log l’action puis redirige', async () => {
    communeMocks.createCommune.mockResolvedValueOnce({
      data: {
        id: 'co1',
        name: 'Commune des Lilas',
        slug: 'commune-des-lilas',
        city: 'Les Lilas',
        description: null,
        treasurer_id: null,
        created_at: 'c',
        updated_at: 'u',
      },
      error: null,
    });
    adminMocks.logAdminAction.mockResolvedValueOnce({ data: { id: 'l1' }, error: null });
    renderPage();
    fireEvent.change(screen.getByLabelText(/Nom de la commune/i), {
      target: { value: 'Commune des Lilas' },
    });
    fireEvent.change(screen.getByLabelText(/Ville/i), {
      target: { value: 'Les Lilas' },
    });
    fireEvent.submit(screen.getByLabelText(/Création d'une commune/i));
    await waitFor(() => expect(screen.getByTestId('detail')).toBeInTheDocument());
    expect(communeMocks.createCommune).toHaveBeenCalled();
    expect(adminMocks.logAdminAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'commune.create',
        targetTable: 'communes',
        targetId: 'co1',
      }),
    );
  });

  it('affiche une erreur quand createCommune échoue', async () => {
    communeMocks.createCommune.mockResolvedValueOnce({
      data: null,
      error: {
        code: '42501',
        message: 'permission denied',
        details: '',
        hint: '',
        name: 'PostgrestError',
      },
    });
    renderPage();
    fireEvent.change(screen.getByLabelText(/Nom de la commune/i), {
      target: { value: 'Commune valide' },
    });
    fireEvent.change(screen.getByLabelText(/Ville/i), { target: { value: 'Ville' } });
    fireEvent.submit(screen.getByLabelText(/Création d'une commune/i));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });
});
