import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';

import { ToastProvider } from './Toast';
import { useToast } from '@/lib/toast';

function TestEmitter() {
  const { show, dismiss } = useToast();
  return (
    <div>
      <button
        type="button"
        onClick={() => show({ message: 'Action réussie', variant: 'success' })}
      >
        emit success
      </button>
      <button
        type="button"
        onClick={() => show({ message: 'Erreur réseau', variant: 'error' })}
      >
        emit error
      </button>
      <button
        type="button"
        onClick={() => {
          const id = show({ message: 'Persistant', durationMs: 0 });
          (window as unknown as { __lastToastId: number }).__lastToastId = id;
        }}
      >
        emit persistent
      </button>
      <button
        type="button"
        onClick={() => {
          const id = (window as unknown as { __lastToastId: number }).__lastToastId;
          dismiss(id);
        }}
      >
        dismiss last
      </button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <ToastProvider>
      <TestEmitter />
    </ToastProvider>,
  );
}

describe('Toast system', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('useToast lance une erreur claire hors provider', () => {
    const originalError = console.error;
    console.error = () => {
      /* silence React error boundary */
    };
    expect(() => render(<TestEmitter />)).toThrow(/ToastProvider/);
    console.error = originalError;
  });

  it('affiche un toast success quand show() est appelé', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('emit success'));
    const toast = screen.getByTestId('toast-item');
    expect(toast).toHaveTextContent('Action réussie');
    expect(toast).toHaveAttribute('data-variant', 'success');
    expect(toast).toHaveAttribute('role', 'status');
    expect(toast).toHaveAttribute('aria-live', 'polite');
  });

  it('utilise role=alert + aria-live=assertive pour les erreurs', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('emit error'));
    const toast = screen.getByTestId('toast-item');
    expect(toast).toHaveAttribute('role', 'alert');
    expect(toast).toHaveAttribute('aria-live', 'assertive');
  });

  it('auto-dismiss après la durée par défaut (4 s)', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('emit success'));
    expect(screen.getByTestId('toast-item')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.queryByTestId('toast-item')).not.toBeInTheDocument();
  });

  it('ne fait pas d’auto-dismiss avec durationMs=0', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('emit persistent'));
    expect(screen.getByTestId('toast-item')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(screen.getByTestId('toast-item')).toBeInTheDocument();
  });

  it('le bouton Fermer dismisse le toast', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('emit persistent'));
    fireEvent.click(screen.getByLabelText('Fermer la notification'));
    expect(screen.queryByTestId('toast-item')).not.toBeInTheDocument();
  });

  it('dismiss(id) retire le toast ciblé', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('emit persistent'));
    fireEvent.click(screen.getByText('dismiss last'));
    expect(screen.queryByTestId('toast-item')).not.toBeInTheDocument();
  });
});
