import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { loadAndInitSentry } from './lib/sentry';

// Fire-and-forget : Sentry init en chunk séparé (~60 kB gzip), n'est chargé
// que si VITE_SENTRY_DSN est défini. Échec silencieux pour ne pas bloquer
// le boot de l'app si le SDK plante.
void loadAndInitSentry({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
