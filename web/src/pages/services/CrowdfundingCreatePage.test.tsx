import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as CrowdfundingModule from '@/lib/crowdfunding';

const cfMocks = vi.hoisted(() => ({
  createCrowdfunding: vi.fn(),
}));

vi.mock('@/lib/crowdfunding', async () => {
  const actual = await vi.importActual<typeof CrowdfundingModule>('@/lib/crowdfunding');
  return {
    ...actual,
    createCrowdfunding: cfMocks.createCrowdfunding,
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
import CrowdfundingCreatePage from './CrowdfundingCreatePage';

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
    <MemoryRouter initialEntries={['/services/crowdfunding/new']}>
      <Routes>
        <Route path="/services/crowdfunding/new" element={<CrowdfundingCreatePage />} />
        <Route
          path="/services/crowdfunding/:id"
          element={<div data-testid="detail">Detail</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  cfMocks.createCrowdfunding.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
  useAuthStore.setState({
    status: 'authenticated',
    user: fakeSession.user as never,
    session: fakeSession as never,
  });
});

describe('CrowdfundingCreatePage', () => {
  it('rend le formulaire', async () => {
    renderCreate();
    expect(
      await screen.findByRole('heading', { name: /Lancer une cagnotte/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Titre$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Objectif/i)).toBeInTheDocument();
  });

  it('soumission avec champs vides : affiche les erreurs', async () => {
    renderCreate();
    const submit = await screen.findByRole('button', { name: /Lancer la cagnotte/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    expect(screen.getByText(/Le titre doit faire entre/i)).toBeInTheDocument();
    expect(cfMocks.createCrowdfunding).not.toHaveBeenCalled();
  });

  it('soumission valide : redirige vers la fiche', async () => {
    cfMocks.createCrowdfunding.mockResolvedValueOnce({
      data: {
        id: 'cf1',
        organizer_id: 'u1',
        title: 'Caisse de grève intersyndicale',
        slug: 'caisse-de-greve-intersyndicale',
        summary:
          'Une caisse pour soutenir les grévistes pendant la mobilisation contre la réforme des retraites.',
        body: null,
        goal_eur: 5000,
        raised_eur: 0,
        cover_url: null,
        status: 'published' as const,
        starts_at: '2026-05-01T00:00:00Z',
        ends_at: null,
        created_at: '2026-05-01T00:00:00Z',
        updated_at: '2026-05-01T00:00:00Z',
      },
      error: null,
    });
    renderCreate();

    fireEvent.change(await screen.findByLabelText(/^Titre$/i), {
      target: { value: 'Caisse de grève intersyndicale' },
    });
    fireEvent.change(screen.getByLabelText(/^Résumé$/i), {
      target: {
        value:
          'Une caisse pour soutenir les grévistes pendant la mobilisation contre la réforme des retraites.',
      },
    });
    fireEvent.change(screen.getByLabelText(/Objectif/i), { target: { value: '5000' } });

    const submit = screen.getByRole('button', { name: /Lancer la cagnotte/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    await waitFor(() => expect(cfMocks.createCrowdfunding).toHaveBeenCalled());
    expect(await screen.findByTestId('detail')).toBeInTheDocument();
  });
});
