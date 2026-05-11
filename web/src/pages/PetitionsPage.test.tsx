import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type * as PetitionsModule from '@/lib/petitions';

const petitionsMocks = vi.hoisted(() => ({
  listPetitions: vi.fn(),
}));

vi.mock('@/lib/petitions', async () => {
  const actual = await vi.importActual<typeof PetitionsModule>('@/lib/petitions');
  return {
    ...actual,
    listPetitions: petitionsMocks.listPetitions,
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
import type { PetitionRow } from '@/lib/petitions';
import PetitionsPage from './PetitionsPage';

const samplePetition = (overrides: Partial<PetitionRow> = {}): PetitionRow => ({
  id: 'p1',
  author_id: 'u1',
  title: 'Sauvons la maternité de Cherbourg',
  slug: 'sauvons-la-maternite-de-cherbourg',
  summary: 'Une mobilisation citoyenne contre la fermeture annoncée.',
  body: 'Body long',
  target_count: 5000,
  cover_url: null,
  category: 'Santé',
  status: 'published',
  signature_count: 1234,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/petitions']}>
      <PetitionsPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  petitionsMocks.listPetitions.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('PetitionsPage', () => {
  it('rend le listing avec compteur et progression', async () => {
    petitionsMocks.listPetitions.mockResolvedValueOnce({
      data: [samplePetition(), samplePetition({ id: 'p2', title: 'Pétition B', slug: 'pet-b' })],
      error: null,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
    expect(
      screen.getByRole('heading', { name: /Sauvons la maternité de Cherbourg/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/2 pétitions/i)).toBeInTheDocument();
    expect(petitionsMocks.listPetitions).toHaveBeenCalled();
  });

  it('affiche l’état vide quand aucune pétition', async () => {
    petitionsMocks.listPetitions.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    expect(await screen.findByText(/Aucune pétition trouvée/i)).toBeInTheDocument();
  });

  it('soumission de la recherche appelle listPetitions avec search', async () => {
    petitionsMocks.listPetitions.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    await waitFor(() => expect(petitionsMocks.listPetitions).toHaveBeenCalledTimes(1));

    const input = screen.getByRole('searchbox', { name: /Rechercher une pétition/i });
    fireEvent.change(input, { target: { value: 'cherbourg' } });
    petitionsMocks.listPetitions.mockResolvedValueOnce({ data: [], error: null });
    fireEvent.submit(input);

    await waitFor(() =>
      expect(petitionsMocks.listPetitions).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'cherbourg' }),
      ),
    );
  });

  it('changement de catégorie filtre via category', async () => {
    petitionsMocks.listPetitions.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    await waitFor(() => expect(petitionsMocks.listPetitions).toHaveBeenCalledTimes(1));

    petitionsMocks.listPetitions.mockResolvedValueOnce({ data: [], error: null });
    fireEvent.change(screen.getByRole('combobox', { name: /Filtrer par catégorie/i }), {
      target: { value: 'Santé' },
    });

    await waitFor(() =>
      expect(petitionsMocks.listPetitions).toHaveBeenLastCalledWith(
        expect.objectContaining({ category: 'Santé' }),
      ),
    );
  });

  it('affiche l’erreur Postgrest mappée en FR', async () => {
    petitionsMocks.listPetitions.mockResolvedValueOnce({
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
