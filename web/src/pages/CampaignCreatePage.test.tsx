import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as CampaignsModule from '@/lib/campaigns';
import type * as PetitionsModule from '@/lib/petitions';
import type * as MobilizationsModule from '@/lib/mobilizations';
import type * as PollsModule from '@/lib/polls';

const campaignsMocks = vi.hoisted(() => ({
  createCampaign: vi.fn(),
}));

const petitionsMocks = vi.hoisted(() => ({
  listPetitions: vi.fn(),
}));

const mobilizationsMocks = vi.hoisted(() => ({
  listMobilizations: vi.fn(),
}));

const pollsMocks = vi.hoisted(() => ({
  listPolls: vi.fn(),
}));

vi.mock('@/lib/campaigns', async () => {
  const actual = await vi.importActual<typeof CampaignsModule>('@/lib/campaigns');
  return {
    ...actual,
    createCampaign: campaignsMocks.createCampaign,
  };
});

vi.mock('@/lib/petitions', async () => {
  const actual = await vi.importActual<typeof PetitionsModule>('@/lib/petitions');
  return {
    ...actual,
    listPetitions: petitionsMocks.listPetitions,
  };
});

vi.mock('@/lib/mobilizations', async () => {
  const actual = await vi.importActual<typeof MobilizationsModule>('@/lib/mobilizations');
  return {
    ...actual,
    listMobilizations: mobilizationsMocks.listMobilizations,
  };
});

vi.mock('@/lib/polls', async () => {
  const actual = await vi.importActual<typeof PollsModule>('@/lib/polls');
  return {
    ...actual,
    listPolls: pollsMocks.listPolls,
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
import CampaignCreatePage from './CampaignCreatePage';

const fakeSession = {
  access_token: 'a',
  refresh_token: 'r',
  expires_at: 0,
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'u1', email: 'me@x.org', user_metadata: {} },
};

const samplePetition = {
  id: 'p1',
  author_id: 'u9',
  title: 'Stop à la fermeture de la maternité',
  slug: 'stop-fermeture',
  summary: 'Pour préserver l’accès aux soins.',
  body: 'X',
  category: 'Santé',
  signature_count: 0,
  target_count: 1000,
  cover_url: null,
  status: 'published' as const,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

function renderCreate() {
  return render(
    <MemoryRouter initialEntries={['/campaigns/new']}>
      <Routes>
        <Route path="/campaigns/new" element={<CampaignCreatePage />} />
        <Route path="/campaigns/:slug" element={<div data-testid="detail">Detail</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  campaignsMocks.createCampaign.mockReset();
  petitionsMocks.listPetitions.mockReset();
  mobilizationsMocks.listMobilizations.mockReset();
  pollsMocks.listPolls.mockReset();
  authMocks.getSession.mockReset();

  petitionsMocks.listPetitions.mockResolvedValue({ data: [samplePetition], error: null });
  mobilizationsMocks.listMobilizations.mockResolvedValue({ data: [], error: null });
  pollsMocks.listPolls.mockResolvedValue({ data: [], error: null });

  authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
  useAuthStore.setState({
    status: 'authenticated',
    user: fakeSession.user as never,
    session: fakeSession as never,
  });
});

describe('CampaignCreatePage', () => {
  it('rend le formulaire complet (titre, résumé, manifeste, actions)', async () => {
    renderCreate();
    expect(
      await screen.findByRole('heading', { name: /Lancer une campagne/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Titre de la campagne/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Résumé$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Manifeste détaillé/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Pétitions/i })).toBeInTheDocument();
  });

  it('soumission avec champs vides : affiche les erreurs de validation FR', async () => {
    renderCreate();
    const submit = await screen.findByRole('button', { name: /Publier la campagne/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    expect(screen.getByText(/Le titre doit faire entre/i)).toBeInTheDocument();
    expect(screen.getByText(/Le résumé doit faire entre/i)).toBeInTheDocument();
    expect(campaignsMocks.createCampaign).not.toHaveBeenCalled();
  });

  it('sélection d’une pétition + soumission valide : redirige vers la fiche', async () => {
    campaignsMocks.createCampaign.mockResolvedValueOnce({
      data: {
        campaign: {
          id: 'c1',
          author_id: 'u1',
          title: 'Sauvons la maternité de Cherbourg',
          slug: 'sauvons-la-maternite-de-cherbourg',
          summary: 'X',
          body: null,
          cover_url: null,
          status: 'published',
          created_at: '2026-05-01T00:00:00Z',
          updated_at: '2026-05-01T00:00:00Z',
        },
        actions: [],
      },
      error: null,
    });
    renderCreate();

    await screen.findByRole('button', { name: /Stop à la fermeture de la maternité/i });

    fireEvent.change(screen.getByLabelText(/Titre de la campagne/i), {
      target: { value: 'Sauvons la maternité de Cherbourg' },
    });
    fireEvent.change(screen.getByLabelText(/^Résumé$/i), {
      target: {
        value: 'Une campagne territoriale pour préserver l’accès local aux soins maternels.',
      },
    });

    fireEvent.click(screen.getByRole('button', { name: /Stop à la fermeture de la maternité/i }));

    const submit = screen.getByRole('button', { name: /Publier la campagne/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    await waitFor(() => expect(campaignsMocks.createCampaign).toHaveBeenCalled());
    expect(await screen.findByTestId('detail')).toBeInTheDocument();
  });
});
