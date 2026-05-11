import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as MarketplaceModule from '@/lib/marketplace';

const marketMocks = vi.hoisted(() => ({
  createMarketplaceItem: vi.fn(),
}));

vi.mock('@/lib/marketplace', async () => {
  const actual = await vi.importActual<typeof MarketplaceModule>('@/lib/marketplace');
  return {
    ...actual,
    createMarketplaceItem: marketMocks.createMarketplaceItem,
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
import MarketplaceCreatePage from './MarketplaceCreatePage';

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
    <MemoryRouter initialEntries={['/services/marketplace/new']}>
      <Routes>
        <Route path="/services/marketplace/new" element={<MarketplaceCreatePage />} />
        <Route
          path="/services/marketplace/:id"
          element={<div data-testid="detail">Detail</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  marketMocks.createMarketplaceItem.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
  useAuthStore.setState({
    status: 'authenticated',
    user: fakeSession.user as never,
    session: fakeSession as never,
  });
});

describe('MarketplaceCreatePage', () => {
  it('rend le formulaire complet', async () => {
    renderCreate();
    expect(
      await screen.findByRole('heading', { name: /Publier une annonce/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Titre$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Catégorie$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Ville$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prix en euros/i)).toBeInTheDocument();
  });

  it('soumission sans prix ni T99CP : affiche l’erreur', async () => {
    renderCreate();
    fireEvent.change(await screen.findByLabelText(/^Titre$/i), {
      target: { value: 'Vélo cargo' },
    });
    fireEvent.change(screen.getByLabelText(/^Catégorie$/i), { target: { value: 'Vélo' } });
    fireEvent.change(screen.getByLabelText(/^Ville$/i), { target: { value: 'Paris' } });

    const submit = screen.getByRole('button', { name: /Publier l’annonce/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    expect(
      screen.getByText(/Renseignez au moins un prix en euros ou un coût en T99CP/i),
    ).toBeInTheDocument();
    expect(marketMocks.createMarketplaceItem).not.toHaveBeenCalled();
  });

  it('soumission valide : redirige vers la fiche', async () => {
    marketMocks.createMarketplaceItem.mockResolvedValueOnce({
      data: {
        id: 'm1',
        seller_id: 'u1',
        title: 'Vélo cargo',
        description: null,
        category: 'Vélo',
        city: 'Paris',
        price_eur: 250,
        t99cp_cost: null,
        is_sold: false,
        created_at: '2026-05-01T00:00:00Z',
        updated_at: '2026-05-01T00:00:00Z',
      },
      error: null,
    });
    renderCreate();

    fireEvent.change(await screen.findByLabelText(/^Titre$/i), {
      target: { value: 'Vélo cargo' },
    });
    fireEvent.change(screen.getByLabelText(/^Catégorie$/i), { target: { value: 'Vélo' } });
    fireEvent.change(screen.getByLabelText(/^Ville$/i), { target: { value: 'Paris' } });
    fireEvent.change(screen.getByLabelText(/Prix en euros/i), { target: { value: '250' } });

    const submit = screen.getByRole('button', { name: /Publier l’annonce/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    await waitFor(() => expect(marketMocks.createMarketplaceItem).toHaveBeenCalled());
    expect(await screen.findByTestId('detail')).toBeInTheDocument();
  });
});
