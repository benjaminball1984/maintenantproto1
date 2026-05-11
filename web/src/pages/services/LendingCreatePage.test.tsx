import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as LendingModule from '@/lib/lending';

const lendingMocks = vi.hoisted(() => ({
  createLending: vi.fn(),
}));

vi.mock('@/lib/lending', async () => {
  const actual = await vi.importActual<typeof LendingModule>('@/lib/lending');
  return {
    ...actual,
    createLending: lendingMocks.createLending,
  };
});

const authMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: authMocks },
}));

import { useAuthStore } from '@/lib/auth';
import LendingCreatePage from './LendingCreatePage';

const fakeSession = {
  access_token: 'a',
  refresh_token: 'r',
  expires_at: 0,
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'u1', email: 'me@x.org', user_metadata: {} },
};

function renderCreate() {
  return render(
    <MemoryRouter initialEntries={['/services/lending/new']}>
      <Routes>
        <Route path="/services/lending/new" element={<LendingCreatePage />} />
        <Route path="/services/lending/:id" element={<div data-testid="detail">Detail</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  lendingMocks.createLending.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
  useAuthStore.setState({
    status: 'authenticated',
    user: fakeSession.user as never,
    session: fakeSession as never,
  });
});

describe('LendingCreatePage', () => {
  it('rend le formulaire complet', async () => {
    renderCreate();
    expect(
      await screen.findByRole('heading', { name: /Proposer un prêt/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Titre$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Catégorie$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Ville$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Coût en T99CP/i)).toBeInTheDocument();
  });

  it('soumission avec champs vides : affiche les erreurs', async () => {
    renderCreate();
    const submit = await screen.findByRole('button', { name: /Publier l’annonce/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    expect(screen.getByText(/Le titre doit faire entre/i)).toBeInTheDocument();
    expect(lendingMocks.createLending).not.toHaveBeenCalled();
  });

  it('soumission valide : redirige vers la fiche', async () => {
    lendingMocks.createLending.mockResolvedValueOnce({
      data: {
        id: 'l1',
        owner_id: 'u1',
        title: 'Perceuse Bosch',
        description: null,
        category: 'Outillage',
        city: 'Paris',
        t99cp_cost: 5,
        is_available: true,
        created_at: '2026-05-01T00:00:00Z',
        updated_at: '2026-05-01T00:00:00Z',
      },
      error: null,
    });
    renderCreate();

    fireEvent.change(await screen.findByLabelText(/^Titre$/i), {
      target: { value: 'Perceuse Bosch' },
    });
    fireEvent.change(screen.getByLabelText(/^Catégorie$/i), {
      target: { value: 'Outillage' },
    });
    fireEvent.change(screen.getByLabelText(/^Ville$/i), {
      target: { value: 'Paris' },
    });
    fireEvent.change(screen.getByLabelText(/Coût en T99CP/i), {
      target: { value: '5' },
    });

    const submit = screen.getByRole('button', { name: /Publier l’annonce/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    await waitFor(() => expect(lendingMocks.createLending).toHaveBeenCalled());
    expect(await screen.findByTestId('detail')).toBeInTheDocument();
  });
});
