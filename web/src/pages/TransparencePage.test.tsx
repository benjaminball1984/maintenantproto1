import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type * as TransparencyModule from '@/lib/transparency';

type TransparencyResult = TransparencyModule.TransparencyResult;
type MonthlySignupsResult = TransparencyModule.MonthlySignupsResult;
type T99cpTotalResult = TransparencyModule.T99cpTotalResult;

const fetchTransparencyCountsMock = vi.fn<() => Promise<TransparencyResult>>();
const fetchMonthlySignupsMock = vi.fn<() => Promise<MonthlySignupsResult>>();
const fetchT99cpTotalMock = vi.fn<() => Promise<T99cpTotalResult>>();

vi.mock('@/lib/transparency', async () => {
  const actual = await vi.importActual<typeof TransparencyModule>('@/lib/transparency');
  return {
    ...actual,
    fetchTransparencyCounts: (...args: unknown[]) => fetchTransparencyCountsMock(...(args as [])),
    fetchMonthlySignups: (...args: unknown[]) => fetchMonthlySignupsMock(...(args as [])),
    fetchT99cpTotal: (...args: unknown[]) => fetchT99cpTotalMock(...(args as [])),
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
  fetchT99cpTotalMock.mockReset();
  // Par défaut : tous les buckets à zéro. Évite que les tests existants
  // doivent expliciter ce second fetch à chaque fois.
  fetchMonthlySignupsMock.mockResolvedValue({ data: [], error: null });
  // Par défaut : pas de carte T99CP affichée (RPC en erreur) — la majorité
  // des tests existants ne valident pas la carte T99CP. Les tests dédiés
  // surchargent via `mockResolvedValueOnce`.
  fetchT99cpTotalMock.mockResolvedValue({ data: null, error: null });
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

  it('affiche la carte T99CP cumulée quand la RPC réussit', async () => {
    fetchTransparencyCountsMock.mockResolvedValueOnce({ data: ZERO_COUNTS, error: null });
    fetchT99cpTotalMock.mockReset();
    fetchT99cpTotalMock.mockResolvedValueOnce({ data: 3600, error: null });
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('t99cp-total-card')).toBeInTheDocument();
    });
    expect(screen.getByText('T99CP émis (cumulé)')).toBeInTheDocument();
    // 3600 reste sous le seuil de regroupement de milliers (1000 utilise un
    // séparateur en fr-FR), mais on matche le nombre formaté pour rester
    // robuste aux versions ICU.
    expect(screen.getByText(/^3\s?600$/)).toBeInTheDocument();
  });

  it('affiche la carte T99CP à 0 quand la RPC retourne 0 (pré-1er-adhérent)', async () => {
    fetchTransparencyCountsMock.mockResolvedValueOnce({ data: ZERO_COUNTS, error: null });
    fetchT99cpTotalMock.mockReset();
    fetchT99cpTotalMock.mockResolvedValueOnce({ data: 0, error: null });
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('t99cp-total-card')).toBeInTheDocument();
    });
    expect(screen.getByText('T99CP émis (cumulé)')).toBeInTheDocument();
  });

  it('masque silencieusement la carte T99CP quand la RPC échoue', async () => {
    fetchTransparencyCountsMock.mockResolvedValueOnce({ data: ZERO_COUNTS, error: null });
    fetchT99cpTotalMock.mockReset();
    fetchT99cpTotalMock.mockResolvedValueOnce({
      data: null,
      error: {
        message: 'function_not_found',
        details: '',
        hint: '',
        code: 'PGRST',
        name: 'PostgrestError',
      } as never,
    });
    renderPage();
    // On attend d'abord que les autres compteurs soient rendus, puis on
    // vérifie l'absence de la carte T99CP. Sinon le test passerait
    // trivialement avant même que `fetchT99cpTotal` n'ait résolu.
    await waitFor(() => {
      expect(screen.getByRole('list', { name: /Compteurs publics/i })).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(fetchT99cpTotalMock).toHaveBeenCalled();
    });
    expect(screen.queryByTestId('t99cp-total-card')).not.toBeInTheDocument();
    expect(screen.queryByText('T99CP émis (cumulé)')).not.toBeInTheDocument();
  });

  it('annule proprement le setState T99CP si démontage avant fetch', async () => {
    fetchTransparencyCountsMock.mockResolvedValueOnce({ data: ZERO_COUNTS, error: null });
    fetchT99cpTotalMock.mockReset();
    let resolveT99cp: (v: T99cpTotalResult) => void = () => undefined;
    fetchT99cpTotalMock.mockReturnValueOnce(
      new Promise((res) => {
        resolveT99cp = res;
      }),
    );
    const { unmount } = renderPage();
    unmount();
    resolveT99cp({ data: 42, error: null });
    await new Promise((r) => setTimeout(r, 0));
  });

  // Étape 37 — polish /transparence.
  it('affiche les microcopies « comment c\'est calculé » sous chaque compteur', async () => {
    fetchTransparencyCountsMock.mockResolvedValueOnce({
      data: {
        members: 10,
        publishedPetitions: 1,
        publishedMobilizations: 1,
        publishedCampaigns: 1,
        publishedCommunes: 1,
        signatures: 5,
      },
      error: null,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('list', { name: /Compteurs publics/i })).toBeInTheDocument();
    });
    // Chaque compteur expose son explication (count(*) sur la table…).
    expect(screen.getByText(/count\(\*\) sur public\.users/i)).toBeInTheDocument();
    expect(screen.getByText(/count\(\*\) sur public\.signatures/i)).toBeInTheDocument();
    // Les 4 tables filtrées par status (petitions, mobilizations, campaigns, communes).
    const publishedHints = screen.getAllByText(/status = « published »/);
    expect(publishedHints.length).toBe(4);
  });

  it('agrandit le graphique mensuel via minHeight 360 px (étape 37)', async () => {
    fetchTransparencyCountsMock.mockResolvedValueOnce({ data: ZERO_COUNTS, error: null });
    fetchMonthlySignupsMock.mockReset();
    fetchMonthlySignupsMock.mockResolvedValueOnce({
      data: [{ monthIso: '2026-05-01', count: 3 }],
      error: null,
    });
    renderPage();
    const chart = await screen.findByTestId('monthly-signups-chart');
    // `style.minHeight` reflète la prop minHeight (360 px) — réactif au resize.
    expect(chart.style.minHeight).toBe('360px');
  });

  it('affiche un lien vers /decouvrir en bas de page (étape 37)', async () => {
    fetchTransparencyCountsMock.mockResolvedValueOnce({ data: ZERO_COUNTS, error: null });
    renderPage();
    const link = screen.getByRole('link', { name: /Découvrir Maintenant/i });
    expect(link).toHaveAttribute('href', '/decouvrir');
  });

  it('met en avant la carte T99CP via fond contrasté (étape 37)', async () => {
    fetchTransparencyCountsMock.mockResolvedValueOnce({ data: ZERO_COUNTS, error: null });
    fetchT99cpTotalMock.mockReset();
    fetchT99cpTotalMock.mockResolvedValueOnce({ data: 100, error: null });
    renderPage();
    const card = await screen.findByTestId('t99cp-total-card');
    // Le fond utilise `--mn-brand-light` (et non `--mn-surface-2` comme les
    // autres cartes) pour distinguer visuellement le compteur T99CP.
    expect(card.style.background).toMatch(/mn-brand-light/);
  });
});
