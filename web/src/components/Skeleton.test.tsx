import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import Skeleton, { SkeletonCardList } from './Skeleton';

describe('Skeleton', () => {
  it('rend un bloc avec la classe mn-skeleton', () => {
    render(<Skeleton testId="sk-1" />);
    const sk = screen.getByTestId('sk-1');
    expect(sk).toHaveClass('mn-skeleton');
  });

  it('propage width / height / radius en style inline', () => {
    render(<Skeleton testId="sk-2" width={200} height={24} radius={4} />);
    const sk = screen.getByTestId('sk-2');
    expect(sk.style.width).toBe('200px');
    expect(sk.style.height).toBe('24px');
    expect(sk.style.borderRadius).toBe('4px');
  });

  it('expose aria-label quand label fourni', () => {
    render(<Skeleton label="Chargement du titre…" />);
    expect(screen.getByLabelText('Chargement du titre…')).toBeInTheDocument();
  });
});

describe('SkeletonCardList', () => {
  it('rend N cards skeleton (défaut 3)', () => {
    render(<SkeletonCardList />);
    expect(screen.getAllByTestId('skeleton-card')).toHaveLength(3);
  });

  it('rend le nombre demandé de cards', () => {
    render(<SkeletonCardList count={5} />);
    expect(screen.getAllByTestId('skeleton-card')).toHaveLength(5);
  });

  it('expose un seul role="status" + aria-live polite avec un label unique', () => {
    render(<SkeletonCardList label="Chargement des pétitions…" />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-label', 'Chargement des pétitions…');
  });
});
