import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import RoadmapPage from './RoadmapPage';
import { ROADMAP_ITEMS } from './roadmapData';

function renderPage() {
  return render(
    <MemoryRouter>
      <RoadmapPage />
    </MemoryRouter>,
  );
}

describe('RoadmapPage', () => {
  it('affiche le H1 « Notre feuille de route 2026 — 2028 »', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: /feuille de route/i }),
    ).toBeInTheDocument();
  });

  it('rend la timeline avec au moins 5 jalons', () => {
    renderPage();
    const timeline = screen.getByTestId('roadmap-timeline');
    expect(timeline.tagName).toBe('OL');
    expect(timeline.querySelectorAll('li').length).toBeGreaterThanOrEqual(5);
  });

  it('rend les 3 états de jalon (done / in-progress / planned)', () => {
    renderPage();
    const allItems = document.querySelectorAll('[data-testid^="roadmap-item-"]');
    const statuses = Array.from(allItems).map((el) => el.getAttribute('data-status'));
    expect(statuses).toContain('done');
    expect(statuses).toContain('in-progress');
    expect(statuses).toContain('planned');
  });

  it('rend les items dans l’ordre chronologique (selon ROADMAP_ITEMS)', () => {
    renderPage();
    const allItems = document.querySelectorAll('[data-testid^="roadmap-item-"]');
    const idsInDom = Array.from(allItems).map(
      (el) => el.getAttribute('data-testid')?.replace('roadmap-item-', '') ?? '',
    );
    const idsExpected = ROADMAP_ITEMS.map((it) => it.id);
    expect(idsInDom).toEqual(idsExpected);
  });

  it('expose la légende des 3 statuts avec leurs libellés', () => {
    renderPage();
    // Chaque libellé apparaît au moins une fois dans la légende ET une
    // fois par jalon partageant son statut → on accepte ≥ 1.
    expect(screen.getAllByText('Livré').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('En cours').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Planifié').length).toBeGreaterThanOrEqual(1);
  });

  it('expose des liens internes vers /about, /decouvrir, /legal/contact', () => {
    renderPage();
    const links = screen.getAllByRole('link');
    const hrefs = links.map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/about');
    expect(hrefs).toContain('/decouvrir');
    expect(hrefs).toContain('/legal/contact');
  });
});
