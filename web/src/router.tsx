import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import RequireAdmin from './components/RequireAdmin';
import RequireAuth from './components/RequireAuth';
import RootLayout from './layouts/RootLayout';

// Toutes les pages sont chargées en `lazy()` pour le code-splitting par route.
// Le `<Suspense>` global et le `<RouteErrorBoundary>` sont co-localisés dans
// `RootLayout` autour de `<Outlet />` : un seul fallback de chargement et un
// seul filet pour les `ChunkLoadError` (déploiement intermédiaire).
const HomePage = lazy(() => import('./pages/HomePage'));
const PetitionsPage = lazy(() => import('./pages/PetitionsPage'));
const PetitionDetailPage = lazy(() => import('./pages/PetitionDetailPage'));
const PetitionCreatePage = lazy(() => import('./pages/PetitionCreatePage'));
const MobilizationsPage = lazy(() => import('./pages/MobilizationsPage'));
const MobilizationDetailPage = lazy(() => import('./pages/MobilizationDetailPage'));
const MobilizationCreatePage = lazy(() => import('./pages/MobilizationCreatePage'));
const CampaignsPage = lazy(() => import('./pages/CampaignsPage'));
const CampaignDetailPage = lazy(() => import('./pages/CampaignDetailPage'));
const CampaignCreatePage = lazy(() => import('./pages/CampaignCreatePage'));
const ServicesHubPage = lazy(() => import('./pages/services/ServicesHubPage'));
const HousingPage = lazy(() => import('./pages/services/HousingPage'));
const HousingDetailPage = lazy(() => import('./pages/services/HousingDetailPage'));
const HousingCreatePage = lazy(() => import('./pages/services/HousingCreatePage'));
const HousingRequestPage = lazy(() => import('./pages/services/HousingRequestPage'));
const CarpoolingPage = lazy(() => import('./pages/services/CarpoolingPage'));
const CarpoolingDetailPage = lazy(() => import('./pages/services/CarpoolingDetailPage'));
const CarpoolingCreatePage = lazy(() => import('./pages/services/CarpoolingCreatePage'));
const MarketplacePage = lazy(() => import('./pages/services/MarketplacePage'));
const MarketplaceDetailPage = lazy(() => import('./pages/services/MarketplaceDetailPage'));
const MarketplaceCreatePage = lazy(() => import('./pages/services/MarketplaceCreatePage'));
const LendingPage = lazy(() => import('./pages/services/LendingPage'));
const LendingDetailPage = lazy(() => import('./pages/services/LendingDetailPage'));
const LendingCreatePage = lazy(() => import('./pages/services/LendingCreatePage'));
const GardenPage = lazy(() => import('./pages/services/GardenPage'));
const GardenDetailPage = lazy(() => import('./pages/services/GardenDetailPage'));
const GardenCreatePage = lazy(() => import('./pages/services/GardenCreatePage'));
const SelPage = lazy(() => import('./pages/services/SelPage'));
const SelDetailPage = lazy(() => import('./pages/services/SelDetailPage'));
const SelCreatePage = lazy(() => import('./pages/services/SelCreatePage'));
const CrowdfundingPage = lazy(() => import('./pages/services/CrowdfundingPage'));
const CrowdfundingDetailPage = lazy(() => import('./pages/services/CrowdfundingDetailPage'));
const CrowdfundingCreatePage = lazy(() => import('./pages/services/CrowdfundingCreatePage'));
const CrowdfundingContributePage = lazy(
  () => import('./pages/services/CrowdfundingContributePage'),
);
const MediaPage = lazy(() => import('./pages/MediaPage'));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'));
const ArticleCreatePage = lazy(() => import('./pages/ArticleCreatePage'));
const ReseauPage = lazy(() => import('./pages/ReseauPage'));
const PollsPage = lazy(() => import('./pages/PollsPage'));
const PollDetailPage = lazy(() => import('./pages/PollDetailPage'));
const PollCreatePage = lazy(() => import('./pages/PollCreatePage'));
const MessagingPage = lazy(() => import('./pages/MessagingPage'));
const MessagingConversationPage = lazy(() => import('./pages/MessagingConversationPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const JoinPage = lazy(() => import('./pages/JoinPage'));
const CommunesPage = lazy(() => import('./pages/CommunesPage'));
const CommuneDetailPage = lazy(() => import('./pages/CommuneDetailPage'));
const CommuneCreatePage = lazy(() => import('./pages/CommuneCreatePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const LegalNoticePage = lazy(() => import('./pages/LegalNoticePage'));
const CookiesPage = lazy(() => import('./pages/CookiesPage'));
const TransparencePage = lazy(() => import('./pages/TransparencePage'));
const DecouvrirPage = lazy(() => import('./pages/DecouvrirPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'petitions', element: <PetitionsPage /> },
      {
        path: 'petitions/new',
        element: (
          <RequireAuth>
            <PetitionCreatePage />
          </RequireAuth>
        ),
      },
      { path: 'petitions/:slug', element: <PetitionDetailPage /> },
      { path: 'mobilizations', element: <MobilizationsPage /> },
      {
        path: 'mobilizations/new',
        element: (
          <RequireAuth>
            <MobilizationCreatePage />
          </RequireAuth>
        ),
      },
      { path: 'mobilizations/:slug', element: <MobilizationDetailPage /> },
      { path: 'campaigns', element: <CampaignsPage /> },
      {
        path: 'campaigns/new',
        element: (
          <RequireAuth>
            <CampaignCreatePage />
          </RequireAuth>
        ),
      },
      { path: 'campaigns/:slug', element: <CampaignDetailPage /> },
      {
        path: 'services',
        children: [
          { index: true, element: <ServicesHubPage /> },
          { path: 'housing', element: <HousingPage /> },
          {
            path: 'housing/new',
            element: (
              <RequireAuth>
                <HousingCreatePage />
              </RequireAuth>
            ),
          },
          { path: 'housing/:id', element: <HousingDetailPage /> },
          {
            path: 'housing/:id/request',
            element: (
              <RequireAuth>
                <HousingRequestPage />
              </RequireAuth>
            ),
          },
          { path: 'carpooling', element: <CarpoolingPage /> },
          {
            path: 'carpooling/new',
            element: (
              <RequireAuth>
                <CarpoolingCreatePage />
              </RequireAuth>
            ),
          },
          { path: 'carpooling/:id', element: <CarpoolingDetailPage /> },
          { path: 'marketplace', element: <MarketplacePage /> },
          {
            path: 'marketplace/new',
            element: (
              <RequireAuth>
                <MarketplaceCreatePage />
              </RequireAuth>
            ),
          },
          { path: 'marketplace/:id', element: <MarketplaceDetailPage /> },
          { path: 'lending', element: <LendingPage /> },
          {
            path: 'lending/new',
            element: (
              <RequireAuth>
                <LendingCreatePage />
              </RequireAuth>
            ),
          },
          { path: 'lending/:id', element: <LendingDetailPage /> },
          { path: 'garden', element: <GardenPage /> },
          {
            path: 'garden/new',
            element: (
              <RequireAuth>
                <GardenCreatePage />
              </RequireAuth>
            ),
          },
          { path: 'garden/:id', element: <GardenDetailPage /> },
          { path: 'sel', element: <SelPage /> },
          {
            path: 'sel/new',
            element: (
              <RequireAuth>
                <SelCreatePage />
              </RequireAuth>
            ),
          },
          { path: 'sel/:id', element: <SelDetailPage /> },
          { path: 'crowdfunding', element: <CrowdfundingPage /> },
          {
            path: 'crowdfunding/new',
            element: (
              <RequireAuth>
                <CrowdfundingCreatePage />
              </RequireAuth>
            ),
          },
          { path: 'crowdfunding/:id', element: <CrowdfundingDetailPage /> },
          {
            path: 'crowdfunding/:id/contribute',
            element: (
              <RequireAuth>
                <CrowdfundingContributePage />
              </RequireAuth>
            ),
          },
        ],
      },
      { path: 'media', element: <MediaPage /> },
      {
        path: 'media/new',
        element: (
          <RequireAuth>
            <ArticleCreatePage />
          </RequireAuth>
        ),
      },
      { path: 'media/:slug', element: <ArticleDetailPage /> },
      { path: 'reseau', element: <ReseauPage /> },
      { path: 'polls', element: <PollsPage /> },
      {
        path: 'polls/new',
        element: (
          <RequireAuth>
            <PollCreatePage />
          </RequireAuth>
        ),
      },
      { path: 'polls/:slug', element: <PollDetailPage /> },
      {
        path: 'messaging',
        element: (
          <RequireAuth>
            <MessagingPage />
          </RequireAuth>
        ),
      },
      {
        path: 'messaging/:conversationId',
        element: (
          <RequireAuth>
            <MessagingConversationPage />
          </RequireAuth>
        ),
      },
      {
        path: 'notifications',
        element: (
          <RequireAuth>
            <NotificationsPage />
          </RequireAuth>
        ),
      },
      {
        path: 'admin',
        element: (
          <RequireAuth>
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          </RequireAuth>
        ),
      },
      { path: 'join', element: <JoinPage /> },
      { path: 'communes', element: <CommunesPage /> },
      {
        path: 'communes/new',
        element: (
          <RequireAuth>
            <RequireAdmin>
              <CommuneCreatePage />
            </RequireAdmin>
          </RequireAuth>
        ),
      },
      { path: 'communes/:slug', element: <CommuneDetailPage /> },
      {
        path: 'profile',
        element: (
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        ),
      },
      { path: 'auth/reset-password', element: <ResetPasswordPage /> },
      { path: 'auth/callback', element: <AuthCallbackPage /> },
      { path: 'transparence', element: <TransparencePage /> },
      { path: 'decouvrir', element: <DecouvrirPage /> },
      {
        path: 'legal',
        children: [
          { path: 'privacy', element: <PrivacyPage /> },
          { path: 'notice', element: <LegalNoticePage /> },
          { path: 'cookies', element: <CookiesPage /> },
          { path: 'contact', element: <ContactPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
