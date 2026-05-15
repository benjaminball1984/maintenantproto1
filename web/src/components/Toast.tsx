import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { IconCheckCircle, IconClose } from '@/components/icons';
import {
  ToastContext,
  type ToastApi,
  type ToastInput,
  type ToastVariant,
} from '@/lib/toast';

interface ToastEntry extends Required<Omit<ToastInput, 'durationMs'>> {
  id: number;
  durationMs: number;
}

const stackStyle: CSSProperties = {
  position: 'fixed',
  bottom: 16,
  right: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  zIndex: 1100,
  maxWidth: 'min(420px, calc(100vw - 32px))',
};

const toastBaseStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 10,
  padding: '10px 12px 10px 14px',
  borderRadius: 12,
  border: '1px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  boxShadow: '0 6px 18px rgba(10, 10, 10, 0.08)',
  fontSize: 14,
  lineHeight: 1.45,
  color: 'var(--mn-text-1)',
};

const variantAccent: Record<ToastVariant, string> = {
  success: 'var(--mn-success)',
  info: 'var(--mn-info)',
  error: 'var(--mn-danger)',
};

const variantLabel: Record<ToastVariant, string> = {
  success: 'Succès',
  info: 'Information',
  error: 'Erreur',
};

const iconWrap = (variant: ToastVariant): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 22,
  height: 22,
  borderRadius: '50%',
  background: 'var(--mn-surface-2)',
  color: variantAccent[variant],
  flex: 'none',
  marginTop: 1,
});

const closeBtnStyle: CSSProperties = {
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  color: 'var(--mn-text-3)',
  padding: 0,
  width: 22,
  height: 22,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: 4,
};

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Provider global. À monter une seule fois dans RootLayout.
 * Garde la file de toasts dans un state local + un compteur d'ids
 * stable via ref (évite les collisions sur double-appel).
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const nextIdRef = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((input: ToastInput): number => {
    const id = nextIdRef.current++;
    const entry: ToastEntry = {
      id,
      message: input.message,
      variant: input.variant ?? 'info',
      durationMs: input.durationMs ?? 4000,
    };
    setToasts((prev) => [...prev, entry]);
    return id;
  }, []);

  // Cleanup auto-dismiss. Un toast avec durationMs=0 reste persistant.
  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts
      .filter((t) => t.durationMs > 0)
      .map((t) =>
        setTimeout(() => {
          setToasts((prev) => prev.filter((p) => p.id !== t.id));
        }, t.durationMs),
      );
    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [toasts]);

  const api = useMemo<ToastApi>(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        style={stackStyle}
        role="region"
        aria-label="Notifications"
        data-testid="toast-stack"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.variant === 'error' ? 'alert' : 'status'}
            aria-live={t.variant === 'error' ? 'assertive' : 'polite'}
            className="mn-toast"
            data-testid="toast-item"
            data-variant={t.variant}
            style={{
              ...toastBaseStyle,
              borderLeft: `4px solid ${variantAccent[t.variant]}`,
            }}
          >
            <span style={iconWrap(t.variant)} aria-hidden>
              <IconCheckCircle width={14} height={14} />
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ position: 'absolute', left: -9999 }}>
                {variantLabel[t.variant]} :
              </span>
              {t.message}
            </span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              style={closeBtnStyle}
              aria-label="Fermer la notification"
            >
              <IconClose width={14} height={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
