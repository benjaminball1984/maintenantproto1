import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type * as CampaignsModule from '@/lib/campaigns';

const campaignsMocks = vi.hoisted(() => ({
  listCampaigns: vi.fn(),
}));

vi.mock('@/lib/campaigns', async () => {
  const actual = await vi.importActual<typeof CampaignsModule>('@/lib/campaigns');
  return {
    ...actual,
    listCampaigns: campaignsMocks.listCampaigns,
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
import type { CampaignRow } from '@/lib/campaigns';
import CampaignsPage from './CampaignsPage';

const sampleCampaign = (overrides: Partial<CampaignRow> = {}): CampaignRow => ({
  id: 'c1',
  author_id: 'u1',
  title: 'Sauvons la maternité de Cherbourg',
  slug: 'sauvons-la-maternite',
  summary: 'Une campagne territoriale pour préserver l’accès aux soins.',
  body: null,
  cover_url: null,
  status: 'published',
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
  ...overrides,
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/campaigns']}>
      <CampaignsPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  campaignsMocks.listCampaigns.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('CampaignsPage', () => {
  it('rend le listing avec compteur de campagnes', async () => {
    campaignsMocks.listCampaigns.mockResolvedValueOnce({
      data: [sampleCampaign(), sampleCampaign({ id: 'c2', slug: 'c2', title: 'Autre campagne' })],
      error: null,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
    expect(
      screen.getByRole('heading', { name: /Sauvons la maternité de Cherbourg/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/2 campagnes/i)).toBeInTheDocument();
  });

  it('affiche l’état vide quand aucune campagne', async () => {
    campaignsMocks.listCampaigns.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    expect(await screen.findByText(/Aucune campagne trouvée/i)).toBeInTheDocument();
  });

  it('soumission de la recherche appelle listCampaigns avec search', async () => {
    campaignsMocks.listCampaigns.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    await waitFor(() => expect(campaignsMocks.listCampaigns).toHaveBeenCalledTimes(1));

    const input = screen.getByRole('searchbox', { name: /Rechercher une campagne/i });
    fireEvent.change(input, { target: { value: 'cherbourg' } });
    campaignsMocks.listCampaigns.mockResolvedValueOnce({ data: [], error: null });
    fireEvent.submit(input);

    await waitFor(() =>
      expect(campaignsMocks.listCampaigns).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'cherbourg' }),
      ),
    );
  });

  it('affiche l’erreur Postgrest mappée en FR', async () => {
    campaignsMocks.listCampaigns.mockResolvedValueOnce({
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
