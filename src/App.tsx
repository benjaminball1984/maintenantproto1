import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import SignPage from '@/pages/SignPage';
import ThanksPage from '@/pages/ThanksPage';
import OrderPage from '@/pages/OrderPage';
import LegalPage from '@/pages/LegalPage';
import PrivacyPage from '@/pages/PrivacyPage';
import ContactPage from '@/pages/ContactPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Lazy : pages lourdes (MapLibre, autocomplete, dates) ou peu visitées
const OrganizePage = lazy(() => import('@/pages/OrganizePage'));
const OrganizeConfirmationPage = lazy(() => import('@/pages/OrganizeConfirmationPage'));
const HowToDistributePage = lazy(() => import('@/pages/HowToDistributePage'));
const MapPage = lazy(() => import('@/pages/MapPage'));
const StatsPage = lazy(() => import('@/pages/StatsPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));

const PageLoader = () => (
  <div className="container mx-auto px-4 py-24 text-center text-ink-muted">
    Chargement…
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/signer" element={<SignPage />} />
        <Route path="/merci" element={<ThanksPage />} />
        <Route path="/commander" element={<OrderPage />} />
        <Route
          path="/organiser"
          element={
            <Suspense fallback={<PageLoader />}>
              <OrganizePage />
            </Suspense>
          }
        />
        <Route
          path="/organiser/confirmation"
          element={
            <Suspense fallback={<PageLoader />}>
              <OrganizeConfirmationPage />
            </Suspense>
          }
        />
        <Route
          path="/comment-distribuer"
          element={
            <Suspense fallback={<PageLoader />}>
              <HowToDistributePage />
            </Suspense>
          }
        />
        <Route
          path="/carte"
          element={
            <Suspense fallback={<PageLoader />}>
              <MapPage />
            </Suspense>
          }
        />
        <Route
          path="/chiffres"
          element={
            <Suspense fallback={<PageLoader />}>
              <StatsPage />
            </Suspense>
          }
        />
        <Route
          path="/qui-sommes-nous"
          element={
            <Suspense fallback={<PageLoader />}>
              <AboutPage />
            </Suspense>
          }
        />
        <Route path="/mentions-legales" element={<LegalPage />} />
        <Route path="/politique-confidentialite" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
