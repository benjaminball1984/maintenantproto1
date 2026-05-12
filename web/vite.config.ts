/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Bornes strictes : on cible uniquement les paquets installés dans
          // node_modules (et leur nom exact), pas un sous-dossier user nommé
          // "react" / des packages dont le nom contient "react" (e.g.
          // `react-is`, `@types/react`, `zustand/react`, `eslint-plugin-react`).
          // Séparateurs unix + windows pour la portabilité CI/dev local.
          const reactCore = /[\\/]node_modules[\\/](?:react|react-dom|scheduler)[\\/]/;
          const router = /[\\/]node_modules[\\/]react-router(?:-dom)?[\\/]/;
          const supabase = /[\\/]node_modules[\\/]@supabase[\\/]/;
          const sentry = /[\\/]node_modules[\\/]@sentry(?:-internal)?[\\/]/;
          if (!/[\\/]node_modules[\\/]/.test(id)) return undefined;
          if (router.test(id)) return 'router';
          if (supabase.test(id)) return 'supabase';
          if (sentry.test(id)) return 'sentry';
          if (reactCore.test(id)) return 'react';
          return 'vendor';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    exclude: ['node_modules', 'dist', 'e2e/**', 'playwright-report/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
    },
  },
});
