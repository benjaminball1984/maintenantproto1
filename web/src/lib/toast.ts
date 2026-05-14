import { createContext, useContext } from 'react';

export type ToastVariant = 'success' | 'info' | 'error';

export interface ToastInput {
  /** Texte court (≤ 80 caractères recommandé). */
  message: string;
  /** Variant visuelle. Défaut : 'info'. */
  variant?: ToastVariant;
  /** Durée avant auto-dismiss en ms. Défaut : 4000. 0 = pas d'auto-dismiss. */
  durationMs?: number;
}

export interface ToastApi {
  /** Ajoute un toast. Retourne son id pour dismiss manuel. */
  show: (input: ToastInput) => number;
  /** Retire un toast par id. */
  dismiss: (id: number) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

/**
 * Hook réactif d'accès au ToastProvider. Doit être appelé sous un
 * <ToastProvider> (intégré au RootLayout pour être global).
 */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast doit être appelé sous <ToastProvider>.');
  }
  return ctx;
}
