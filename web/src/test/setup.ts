import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Stub des variables d'environnement Supabase pour les tests (avant import de supabase.ts).
// En production, ces variables sont fournies via .env.local / Vercel.
vi.stubEnv('VITE_SUPABASE_URL', 'http://localhost:54321');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'public-anon-test-key');

afterEach(() => {
  cleanup();
  try {
    window.localStorage.clear();
  } catch {
    /* jsdom localStorage absente — ignore. */
  }
});
