import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type * as HousingModule from '@/lib/housing';

const housingMocks = vi.hoisted(() => ({
  listHousing: vi.fn(),
}));

vi.mock('@/lib/housing', async () => {
  const actual = await vi.importActual<typeof HousingModule>('@/lib/housing');
  return {
    ...actual,
    listHousing: housingMocks.listHousing,
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
import type { HousingRow } from '@/lib/housing';
import HousingPage from './HousingPage';

const sample = (overrides: Partial<HousingRow> = {}): HousingRow => ({
  id: 'h1',
  host_id: 'u1',
  title: 'Chambre Cherbourg',
  description: 'Belle chambre dans le centre-ville, calme et bien équipée.',
  city: 'Cherbourg',
  capacity: 2,
  available_from: null,
  available_to: null,
  is_published: true,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
  ...overrides,
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/services/housing']}>
      <HousingPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  housingMocks.listHousing.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('HousingPage', () => {
  it('rend le listing avec compteur', async () => {
    housingMocks.listHousing.mockResolvedValueOnce({
      data: [sample(), sample({ id: 'h2', title: 'Studio Lyon', city: 'Lyon' })],
      error: null,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
    expect(
      screen.getByRole('heading', { name: /Chambre Cherbourg/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/2 hébergements/i)).toBeInTheDocument();
  });

  it('affiche l’état vide quand aucun hébergement', async () => {
    housingMocks.listHousing.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    expect(await screen.findByText(/Aucun hébergement trouvé/i)).toBeInTheDocument();
  });

  it('soumission de la recherche appelle listHousing avec search', async () => {
    housingMocks.listHousing.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    await waitFor(() => expect(housingMocks.listHousing).toHaveBeenCalledTimes(1));

    const input = screen.getByRole('searchbox', { name: /Rechercher un hébergement/i });
    fireEvent.change(input, { target: { value: 'cherbourg' } });
    housingMocks.listHousing.mockResolvedValueOnce({ data: [], error: null });
    fireEvent.submit(input);

    await waitFor(() =>
      expect(housingMocks.listHousing).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'cherbourg' }),
      ),
    );
  });

  it('affiche l’erreur Postgrest mappée en FR', async () => {
    housingMocks.listHousing.mockResolvedValueOnce({
      data: [],
      error: {
        message: 'denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    renderPage();
    expect(
      await screen.findByText(/Vous n’avez pas les droits pour effectuer cette action/i),
    ).toBeInTheDocument();
  });
});
