import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import RoadmapPage from './RoadmapPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <RoadmapPage />
    </MemoryRouter>,
  );
}

describe('RoadmapPage', () => {
  it('affiche le H1 « Là où on va »', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: /Là où on va/i })).toBeInTheDocument();
  });

  it('rend une timeline ordonnée avec au moins 6 jalons', () => {
    renderPage();
    const items = screen.getAllByTestId('roadmap-item');
    expect(items.length).toBeGreaterThanOrEqual(6);
  });

  it('expose les 3 états done / in-progress / planned', () => {
    renderPage();
    const items = screen.getAllByTestId('roadmap-item');
    const states = items.map((el) => el.getAttribute('data-state'));
    expect(states).toContain('done');
    expect(states).toContain('in-progress');
    expect(states).toContain('planned');
  });

  it('respecte l’ordre chronologique 2025 → 2028', () => {
    renderPage();
    const items = screen.getAllByTestId('roadmap-item');
    const labels = items.map((el) => el.querySelector('p')?.textContent ?? '');
    const firstYear = labels[0];
    const lastYear = labels[labels.length - 1];
    expect(firstYear).toMatch(/2025/);
    expect(lastYear).toMatch(/2028/);
  });

  it('expose un double CTA Rejoindre / À propos (D-T01 — /decouvrir supprimé)', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /Rejoindre/i })).toHaveAttribute('href', '/join');
    expect(screen.getByRole('link', { name: /À propos/i })).toHaveAttribute('href', '/about');
  });
});
