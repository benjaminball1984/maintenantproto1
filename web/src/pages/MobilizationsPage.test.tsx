import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type * as MobilizationsModule from '@/lib/mobilizations';

const mobilizationsMocks = vi.hoisted(() => ({
  listMobilizations: vi.fn(),
}));

vi.mock('@/lib/mobilizations', async () => {
  const actual = await vi.importActual<typeof MobilizationsModule>('@/lib/mobilizations');
  return {
    ...actual,
    listMobilizations: mobilizationsMocks.listMobilizations,
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
import type { MobilizationRow } from '@/lib/mobilizations';
import MobilizationsPage from './MobilizationsPage';

const sampleMobilization = (overrides: Partial<MobilizationRow> = {}): MobilizationRow => ({
  id: 'm1',
  organizer_id: 'u1',
  title: 'Marche pour le climat',
  slug: 'marche-pour-le-climat',
  summary: 'Une mobilisation pacifique et inter-collectifs pour le climat.',
  body: null,
  starts_at: '2026-06-01T14:00:00Z',
  ends_at: null,
  city: 'Paris',
  address: null,
  cover_url: null,
  status: 'published',
  participation_count: 42,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/mobilizations']}>
      <MobilizationsPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mobilizationsMocks.listMobilizations.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('MobilizationsPage', () => {
  it('rend le listing avec compteur de participants', async () => {
    mobilizationsMocks.listMobilizations.mockResolvedValueOnce({
      data: [
        sampleMobilization(),
        sampleMobilization({ id: 'm2', title: 'AG citoyenne', slug: 'ag-citoyenne' }),
      ],
      error: null,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
    expect(screen.getByRole('heading', { name: /Marche pour le climat/i })).toBeInTheDocument();
    expect(screen.getByText(/2 mobilisations/i)).toBeInTheDocument();
    expect(mobilizationsMocks.listMobilizations).toHaveBeenCalled();
  });

  it('affiche l’état vide quand aucune mobilisation', async () => {
    mobilizationsMocks.listMobilizations.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    expect(await screen.findByText(/Aucune mobilisation trouvée/i)).toBeInTheDocument();
  });

  it('soumission de la recherche appelle listMobilizations avec search', async () => {
    mobilizationsMocks.listMobilizations.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    await waitFor(() => expect(mobilizationsMocks.listMobilizations).toHaveBeenCalledTimes(1));

    const input = screen.getByRole('searchbox', { name: /Rechercher une mobilisation/i });
    fireEvent.change(input, { target: { value: 'climat' } });
    mobilizationsMocks.listMobilizations.mockResolvedValueOnce({ data: [], error: null });
    fireEvent.submit(input);

    await waitFor(() =>
      expect(mobilizationsMocks.listMobilizations).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'climat' }),
      ),
    );
  });

  it('changement de ville filtre via city', async () => {
    mobilizationsMocks.listMobilizations.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    await waitFor(() => expect(mobilizationsMocks.listMobilizations).toHaveBeenCalledTimes(1));

    mobilizationsMocks.listMobilizations.mockResolvedValueOnce({ data: [], error: null });
    fireEvent.change(screen.getByRole('textbox', { name: /Filtrer par ville/i }), {
      target: { value: 'Lyon' },
    });

    await waitFor(() =>
      expect(mobilizationsMocks.listMobilizations).toHaveBeenLastCalledWith(
        expect.objectContaining({ city: 'Lyon' }),
      ),
    );
  });

  it('affiche l’erreur Postgrest mappée en FR', async () => {
    mobilizationsMocks.listMobilizations.mockResolvedValueOnce({
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
