import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type * as TransparencyModule from '@/lib/transparency';

type TransparencyResult = TransparencyModule.TransparencyResult;
type MonthlySignupsResult = TransparencyModule.MonthlySignupsResult;

const fetchTransparencyCountsMock = vi.fn<() => Promise<TransparencyResult>>();
const fetchMonthlySignupsMock = vi.fn<() => Promise<MonthlySignupsResult>>();

vi.mock('@/lib/transparency', async () => {
  const actual = await vi.importActual<typeof TransparencyModule>('@/lib/transparency');
  return {
    ...actual,
    fetchTransparencyCounts: (...args: unknown[]) => fetchTransparencyCountsMock(...(args as [])),
    fetchMonthlySignups: (...args: unknown[]) => fetchMonthlySignupsMock(...(args as [])),
  };
});

import TransparencePage from './TransparencePage';

function renderPage() {
  return render(
    <MemoryRouter>
      <TransparencePage />
    </MemoryRouter>,
  );
}

const ZERO_COUNTS = {
  members: 0,
  publishedPetitions: 0,
  publishedMobilizations: 0,
  publishedCampaigns: 0,
  publishedCommunes: 0,
  signatures: 0,
};

beforeEach(() => {
  fetchTransparencyCountsMock.mockReset();
  fetchMonthlySignupsMock.mockReset();
  // Par défaut : tous les buckets à zéro. Évite que les tests existants
  // doivent expliciter ce second fetch à chaque fois.
  fetchMonthlySignupsMock.mockResolvedValue({ data: [], error: null });
});

describe('TransparencePage', () => {
  it('affiche le titre principal et la date de mise en service', async () => {
    fetchTransparencyCountsMock.mockResolvedValueOnce({ data: ZERO_COUNTS, error: null });
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: /Transparence/i })).toBeInTheDocument();
    expect(screen.getByText(/12 mai 2026/)).toBeInTheDocument();
    await waitFor(() => {
      expect(fetchTransparencyCountsMock).toHaveBeenCalledTimes(1);
    });
  });

  it('affiche les compteurs formatés en français quand le fetch réussit', async () => {
    fetchTransparencyCountsMock.mockResolvedValueOnce({
      data: {
        members: 1234,
        publishedPetitions: 12,
        publishedMobilizations: 5,
        publishedCampaigns: 3,
        publishedCommunes: 2,
        signatures: 56789,
      },
      error: null,
    });
    renderPage();
    // Intl.NumberFormat fr-FR utilise un narrow no-break space (U+202F) entre
    // milliers. On matche sur n'importe quel whitespace pour rester robuste
    // aux variations de version Node / ICU.
    await waitFor(() => {
      expect(screen.getByText(/^1\s234$/)).toBeInTheDocument();
    });
    expect(screen.getByText(/^56\s789$/)).toBeInTheDocument();
    expect(screen.getByText('Pétitions publiées')).toBeInTheDocument();
    expect(screen.getByText('Signatures cumulées')).toBeInTheDocument();
  });

  it("affiche un message d'erreur si le fetch échoue", async () => {
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
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/connection_lost/i);
    });
  });

  it('lien vers la politique de confidentialité', async () => {
    fetchTransparencyCountsMock.mockResolvedValueOnce({ data: ZERO_COUNTS, error: null });
    renderPage();
    const link = screen.getByRole('link', { name: /politique de confidentialité/i });
    expect(link).toHaveAttribute('href', '/legal/privacy');
  });

  it('lien contact en bas de page', async () => {
    fetchTransparencyCountsMock.mockResolvedValueOnce({ data: ZERO_COUNTS, error: null });
    renderPage();
    const contact = screen.getByRole('link', { name: /Contactez-nous/i });
    expect(contact).toHaveAttribute('href', '/legal/contact');
  });

  it('annule proprement le setState si le composant se démonte avant le fetch', async () => {
    let resolveFetch: (v: TransparencyResult) => void = () => undefined;
    fetchTransparencyCountsMock.mockReturnValueOnce(
      new Promise((res) => {
        resolveFetch = res;
      }),
    );
    const { unmount } = renderPage();
    unmount();
    // Résoudre après le unmount : aucun warning React ne doit fuir.
    resolveFetch({
      data: {
        members: 1,
        publishedPetitions: 1,
        publishedMobilizations: 1,
        publishedCampaigns: 1,
        publishedCommunes: 1,
        signatures: 1,
      },
      error: null,
    });
    await new Promise((r) => setTimeout(r, 0));
  });

  it('affiche le graphique mensuel quand des inscriptions existent', async () => {
    fetchTransparencyCountsMock.mockResolvedValueOnce({ data: ZERO_COUNTS, error: null });
    fetchMonthlySignupsMock.mockReset();
    fetchMonthlySignupsMock.mockResolvedValueOnce({
      data: [
        { monthIso: '2025-06-01', count: 0 },
        { monthIso: '2025-07-01', count: 3 },
        { monthIso: '2026-05-01', count: 8 },
      ],
      error: null,
    });
    renderPage();
    await waitFor(() => {
      expect(
        screen.getByRole('img', { name: /Inscriptions par mois/i }),
      ).toBeInTheDocument();
    });
  });

  it('affiche l\'état vide du graphique quand 0 inscription', async () => {
    fetchTransparencyCountsMock.mockResolvedValueOnce({ data: ZERO_COUNTS, error: null });
    fetchMonthlySignupsMock.mockReset();
    fetchMonthlySignupsMock.mockResolvedValueOnce({
      data: [
        { monthIso: '2026-04-01', count: 0 },
        { monthIso: '2026-05-01', count: 0 },
      ],
      error: null,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Aucune inscription enregistrée/i)).toBeInTheDocument();
    });
  });

  it('annule proprement le setState du graphique si démontage avant fetch', async () => {
    fetchTransparencyCountsMock.mockResolvedValueOnce({ data: ZERO_COUNTS, error: null });
    fetchMonthlySignupsMock.mockReset();
    let resolveChart: (v: MonthlySignupsResult) => void = () => undefined;
    fetchMonthlySignupsMock.mockReturnValueOnce(
      new Promise((res) => {
        resolveChart = res;
      }),
    );
    const { unmount } = renderPage();
    unmount();
    // Résoudre après unmount : aucun warning React (« setState on unmounted »)
    // ne doit s'échapper. Symétrique du test équivalent pour le fetch des
    // compteurs (cf. supra).
    resolveChart({
      data: [{ monthIso: '2026-05-01', count: 1 }],
      error: null,
    });
    await new Promise((r) => setTimeout(r, 0));
  });

  it('affiche un message d\'erreur dédié quand le fetch du graphique échoue', async () => {
    fetchTransparencyCountsMock.mockResolvedValueOnce({ data: ZERO_COUNTS, error: null });
    fetchMonthlySignupsMock.mockReset();
    fetchMonthlySignupsMock.mockResolvedValueOnce({
      data: null,
      error: {
        message: 'rls_denied',
        details: '',
        hint: '',
        code: 'PGRST',
        name: 'PostgrestError',
      } as never,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Graphique indisponible/i)).toBeInTheDocument();
    });
  });
});
