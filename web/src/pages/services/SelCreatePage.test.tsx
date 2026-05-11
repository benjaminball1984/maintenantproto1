import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as SelModule from '@/lib/sel';

const selMocks = vi.hoisted(() => ({
  createSelOffer: vi.fn(),
}));

vi.mock('@/lib/sel', async () => {
  const actual = await vi.importActual<typeof SelModule>('@/lib/sel');
  return {
    ...actual,
    createSelOffer: selMocks.createSelOffer,
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
import SelCreatePage from './SelCreatePage';

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
    <MemoryRouter initialEntries={['/services/sel/new']}>
      <Routes>
        <Route path="/services/sel/new" element={<SelCreatePage />} />
        <Route path="/services/sel/:id" element={<div data-testid="detail">Detail</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  selMocks.createSelOffer.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
  useAuthStore.setState({
    status: 'authenticated',
    user: fakeSession.user as never,
    session: fakeSession as never,
  });
});

describe('SelCreatePage', () => {
  it('rend le formulaire', async () => {
    renderCreate();
    expect(
      await screen.findByRole('heading', { name: /Proposer une offre SEL/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Titre$/i)).toBeInTheDocument();
  });

  it('soumission avec champs vides : affiche les erreurs', async () => {
    renderCreate();
    const submit = await screen.findByRole('button', { name: /Publier l’offre/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    expect(screen.getByText(/Le titre doit faire entre/i)).toBeInTheDocument();
    expect(selMocks.createSelOffer).not.toHaveBeenCalled();
  });

  it('soumission valide : redirige vers la fiche', async () => {
    selMocks.createSelOffer.mockResolvedValueOnce({
      data: {
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
      },
      error: null,
    });
    renderCreate();

    fireEvent.change(await screen.findByLabelText(/^Titre$/i), {
      target: { value: 'Cours de guitare' },
    });
    fireEvent.change(screen.getByLabelText(/^Catégorie$/i), { target: { value: 'Musique' } });
    fireEvent.change(screen.getByLabelText(/^Ville$/i), { target: { value: 'Paris' } });

    const submit = screen.getByRole('button', { name: /Publier l’offre/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    await waitFor(() => expect(selMocks.createSelOffer).toHaveBeenCalled());
    expect(await screen.findByTestId('detail')).toBeInTheDocument();
  });
});
