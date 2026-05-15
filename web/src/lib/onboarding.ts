const STORAGE_KEY = 'mn-onboarding-seen';

/**
 * Indique si l'utilisateur a déjà vu la modale d'onboarding.
 * Lecture défensive : `localStorage` peut throw (Safari privacy mode,
 * iframes sans cookies tiers). Dans ce cas on considère qu'on ne sait
 * pas → on ne montre PAS la modale (UX moins intrusive par défaut).
 */
export function hasSeenOnboarding(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return true;
  }
}

/** Marque l'onboarding comme vu. Idempotent, défensif. */
export function markOnboardingSeen(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* swallow */
  }
}
