import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type * as TransparencyModule from '@/lib/transparency';

type TransparencyResult = TransparencyModule.TransparencyResult;
type NewsletterCountResult = TransparencyModule.NewsletterCountResult;

const fetchTransparencyCountsMock = vi.fn<() => Promise<TransparencyResult>>();
const fetchNewsletterCountMock = vi.fn<() => Promise<NewsletterCountResult>>();

vi.mock('@/lib/transparency', async () => {
  const actual = await vi.importActual<typeof TransparencyModule>('@/lib/transparency');
  return {
    ...actual,
    fetchTransparencyCounts: (...args: unknown[]) =>
      fetchTransparencyCountsMock(...(args as [])),
    fetchNewsletterCount: (...args: unknown[]) => fetchNewsletterCountMock(...(args as [])),
  };
});

import HomePage from './HomePage';

const ZERO_COUNTS: TransparencyModule.TransparencyCounts = {
  members: 0,
  publishedPetitions: 0,
  publishedMobilizations: 0,
  publishedCampaigns: 0,
  publishedCommunes: 0,
  signatures: 0,
};

function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  fetchTransparencyCountsMock.mockReset();
  fetchNewsletterCountMock.mockReset();
  fetchTransparencyCountsMock.mockResolvedValue({ data: ZERO_COUNTS, error: null });
  fetchNewsletterCountMock.mockResolvedValue({ data: 0, error: null });
});

describe('HomePage', () => {
  it('affiche le H1 « Maintenant ! La voix des 99% » (D-001)', () => {
    renderHome();
    expect(
      screen.getByRole('heading', { level: 1, name: /La voix des 99%/i }),
    ).toBeInTheDocument();
  });

  it('expose un unique CTA hero « Adhérer » (→ /join) — D-005 supprime Découvrir', () => {
    renderHome();
    const adherer = screen.getByRole('link', { name: /Adhérer au mouvement/i });
    expect(adherer).toHaveAttribute('href', '/join');
    // Plus aucun lien `/decouvrir` côté home.
    const decouvrir = screen.queryByRole('link', { name: /Découvrir le mouvement/i });
    expect(decouvrir).toBeNull();
  });

  it('affiche les 3 compteurs live (signataires, newsletter, membres) — D-007', async () => {
    fetchTransparencyCountsMock.mockReset();
    fetchTransparencyCountsMock.mockResolvedValueOnce({
      data: {
        members: 1500,
        publishedPetitions: 12,
        publishedMobilizations: 5,
        publishedCampaigns: 3,
        publishedCommunes: 2,
        signatures: 56789,
      },
      error: null,
    });
    fetchNewsletterCountMock.mockReset();
    fetchNewsletterCountMock.mockResolvedValueOnce({ data: 8420, error: null });

    renderHome();

    await waitFor(() => {
      expect(screen.getByTestId('home-counter-signatures')).toHaveTextContent(/56\s789/);
    });
    expect(screen.getByTestId('home-counter-newsletter')).toHaveTextContent(/8\s420/);
    expect(screen.getByTestId('home-counter-members')).toHaveTextContent(/1\s500/);
  });

  it('ne rend plus les compteurs Mobilisations / Communes / T99CP — D-009', () => {
    renderHome();
    expect(screen.queryByTestId('home-counter-mobilizations')).toBeNull();
    expect(screen.queryByTestId('home-counter-communes')).toBeNull();
    expect(screen.queryByTestId('home-counter-t99cp')).toBeNull();
  });

  it('affiche un placeholder « … » pendant le chargement des compteurs', () => {
    fetchTransparencyCountsMock.mockReset();
    fetchNewsletterCountMock.mockReset();
    fetchTransparencyCountsMock.mockReturnValueOnce(new Promise(() => undefined));
    fetchNewsletterCountMock.mockReturnValueOnce(new Promise(() => undefined));
    renderHome();
    // 3 cartes en chargement → au moins 3 placeholders aria-label « Chargement… ».
    const placeholders = screen.getAllByLabelText(/Chargement/i);
    expect(placeholders.length).toBeGreaterThanOrEqual(3);
  });

  it('affiche un tiret « — » si fetchTransparencyCounts échoue', async () => {
    fetchTransparencyCountsMock.mockReset();
    fetchTransparencyCountsMock.mockResolvedValueOnce({
      data: null,
      error: {
        message: 'connection_lost',
        details: '',
        hint: '',
        code: 'PGRST',
        name: 'PostgrestError',
      } as never,
    });
    renderHome();
    await waitFor(() => {
      expect(screen.getByTestId('home-counter-signatures')).toHaveTextContent('—');
    });
    expect(screen.getByTestId('home-counter-members')).toHaveTextContent('—');
  });

  it('affiche un tiret « — » si fetchNewsletterCount échoue', async () => {
    fetchNewsletterCountMock.mockReset();
    fetchNewsletterCountMock.mockResolvedValueOnce({
      data: null,
      error: {
        message: 'rpc_failed',
        details: '',
        hint: '',
        code: 'PGRST',
        name: 'PostgrestError',
      } as never,
    });
    renderHome();
    await waitFor(() => {
      expect(screen.getByTestId('home-counter-newsletter')).toHaveTextContent('—');
    });
  });

  it("affiche les 4 cartes d'action thématiques (D-012)", () => {
    renderHome();
    const informer = screen.getByTestId('home-action-informer');
    expect(informer).toHaveAttribute('href', '/media');
    expect(informer).toHaveTextContent(/S.{1,3}informer/i);

    const mobiliser = screen.getByTestId('home-action-mobiliser');
    expect(mobiliser).toHaveAttribute('href', '/petitions');
    expect(mobiliser).toHaveTextContent(/Mobiliser/i);

    const entraider = screen.getByTestId('home-action-entraider');
    expect(entraider).toHaveAttribute('href', '/services');
    expect(entraider).toHaveTextContent(/S.{1,3}entraider/i);

    const agir = screen.getByTestId('home-action-agir');
    expect(agir).toHaveAttribute('href', '/join');
    expect(agir).toHaveTextContent(/Agir/i);
  });

  it("ne rend plus les anciennes cartes feature « Signer ou lancer une pétition » etc. (D-013)", () => {
    renderHome();
    expect(screen.queryByRole('link', { name: /Signer ou lancer une pétition/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /Rejoindre une mobilisation/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /Échanger via les services d'entraide/i })).toBeNull();
  });

  it('ne rend plus le bloc « Notre mission » (D-014)', () => {
    renderHome();
    expect(screen.queryByRole('heading', { level: 2, name: /Notre mission/i })).toBeNull();
  });

  it('garde un lien vers /transparence (encart « sans publicité ni pistage »)', () => {
    renderHome();
    const link = screen.getByRole('link', { name: /^Transparence$/i });
    expect(link).toHaveAttribute('href', '/transparence');
  });

  it('annule proprement le setState compteurs si démontage avant fetch', async () => {
    fetchTransparencyCountsMock.mockReset();
    let resolveCounts: (v: TransparencyResult) => void = () => undefined;
    fetchTransparencyCountsMock.mockReturnValueOnce(
      new Promise((res) => {
        resolveCounts = res;
      }),
    );
    const { unmount } = renderHome();
    unmount();
    resolveCounts({ data: ZERO_COUNTS, error: null });
    await new Promise((r) => setTimeout(r, 0));
  });

  it('annule proprement le setState newsletter si démontage avant fetch', async () => {
    fetchNewsletterCountMock.mockReset();
    let resolveNewsletter: (v: NewsletterCountResult) => void = () => undefined;
    fetchNewsletterCountMock.mockReturnValueOnce(
      new Promise((res) => {
        resolveNewsletter = res;
      }),
    );
    const { unmount } = renderHome();
    unmount();
    resolveNewsletter({ data: 42, error: null });
    await new Promise((r) => setTimeout(r, 0));
  });
});
