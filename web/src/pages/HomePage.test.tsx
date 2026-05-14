import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type * as TransparencyModule from '@/lib/transparency';

type TransparencyResult = TransparencyModule.TransparencyResult;
type T99cpTotalResult = TransparencyModule.T99cpTotalResult;

const fetchTransparencyCountsMock = vi.fn<() => Promise<TransparencyResult>>();
const fetchT99cpTotalMock = vi.fn<() => Promise<T99cpTotalResult>>();

vi.mock('@/lib/transparency', async () => {
  const actual = await vi.importActual<typeof TransparencyModule>('@/lib/transparency');
  return {
    ...actual,
    fetchTransparencyCounts: (...args: unknown[]) =>
      fetchTransparencyCountsMock(...(args as [])),
    fetchT99cpTotal: (...args: unknown[]) => fetchT99cpTotalMock(...(args as [])),
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
  fetchT99cpTotalMock.mockReset();
  fetchTransparencyCountsMock.mockResolvedValue({ data: ZERO_COUNTS, error: null });
  fetchT99cpTotalMock.mockResolvedValue({ data: 0, error: null });
});

describe('HomePage', () => {
  it('affiche le H1 hero contenant « Maintenant ! »', () => {
    renderHome();
    expect(
      screen.getByRole('heading', { level: 1, name: /Maintenant\s*!/i }),
    ).toBeInTheDocument();
  });

  it('expose les deux CTA Adhérer (→ /join) et Découvrir (→ /decouvrir)', () => {
    renderHome();
    const adherer = screen.getByRole('link', { name: /Adhérer/i });
    expect(adherer).toHaveAttribute('href', '/join');
    const decouvrir = screen.getByRole('link', { name: /Découvrir le mouvement/i });
    expect(decouvrir).toHaveAttribute('href', '/decouvrir');
  });

  it('affiche les 4 compteurs live (signataires, mobilisations, communes, T99CP)', async () => {
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
    fetchT99cpTotalMock.mockReset();
    fetchT99cpTotalMock.mockResolvedValueOnce({ data: 3600, error: null });

    renderHome();

    await waitFor(() => {
      expect(screen.getByTestId('home-counter-signatures')).toHaveTextContent(/56\s789/);
    });
    expect(screen.getByTestId('home-counter-mobilizations')).toHaveTextContent(/^.*5/);
    expect(screen.getByTestId('home-counter-communes')).toHaveTextContent(/^.*2/);
    expect(screen.getByTestId('home-counter-t99cp')).toHaveTextContent(/3\s?600/);
  });

  it('affiche un placeholder « … » pendant le chargement des compteurs', () => {
    fetchTransparencyCountsMock.mockReset();
    fetchT99cpTotalMock.mockReset();
    fetchTransparencyCountsMock.mockReturnValueOnce(new Promise(() => undefined));
    fetchT99cpTotalMock.mockReturnValueOnce(new Promise(() => undefined));
    renderHome();
    // 4 cartes en état chargement → 4 placeholders avec aria-label « Chargement… ».
    const placeholders = screen.getAllByLabelText(/Chargement/i);
    expect(placeholders.length).toBeGreaterThanOrEqual(4);
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
    expect(screen.getByTestId('home-counter-mobilizations')).toHaveTextContent('—');
    expect(screen.getByTestId('home-counter-communes')).toHaveTextContent('—');
  });

  it('affiche les 3 cards d\'action (pétitions, mobilisations, services)', () => {
    renderHome();
    expect(screen.getByRole('link', { name: /Signer ou lancer une pétition/i })).toHaveAttribute(
      'href',
      '/petitions',
    );
    expect(screen.getByRole('link', { name: /Rejoindre une mobilisation/i })).toHaveAttribute(
      'href',
      '/mobilizations',
    );
    expect(
      screen.getByRole('link', { name: /Échanger via les services d'entraide/i }),
    ).toHaveAttribute('href', '/services');
  });

  it('affiche la section mission avec lien vers /transparence', () => {
    renderHome();
    expect(screen.getByRole('heading', { level: 2, name: /Notre mission/i })).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Voir nos compteurs publics/i });
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

  it('annule proprement le setState T99CP si démontage avant fetch', async () => {
    fetchT99cpTotalMock.mockReset();
    let resolveT99cp: (v: T99cpTotalResult) => void = () => undefined;
    fetchT99cpTotalMock.mockReturnValueOnce(
      new Promise((res) => {
        resolveT99cp = res;
      }),
    );
    const { unmount } = renderHome();
    unmount();
    resolveT99cp({ data: 42, error: null });
    await new Promise((r) => setTimeout(r, 0));
  });
});
