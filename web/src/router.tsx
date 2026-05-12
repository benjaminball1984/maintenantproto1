import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import RequireAdmin from './components/RequireAdmin';
import RequireAuth from './components/RequireAuth';
import RootLayout from './layouts/RootLayout';

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
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const routeFallback = (
  <div
    role="status"
    aria-live="polite"
    style={{
      minHeight: '40vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--mn-text-3)',
      fontSize: 14,
    }}
  >
    Chargement…
  </div>
);

function withSuspense(node: ReactNode): ReactNode {
  return <Suspense fallback={routeFallback}>{node}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      { path: 'petitions', element: withSuspense(<PetitionsPage />) },
      {
        path: 'petitions/new',
        element: withSuspense(
          <RequireAuth>
            <PetitionCreatePage />
          </RequireAuth>,
        ),
      },
      { path: 'petitions/:slug', element: withSuspense(<PetitionDetailPage />) },
      { path: 'mobilizations', element: withSuspense(<MobilizationsPage />) },
      {
        path: 'mobilizations/new',
        element: withSuspense(
          <RequireAuth>
            <MobilizationCreatePage />
          </RequireAuth>,
        ),
      },
      { path: 'mobilizations/:slug', element: withSuspense(<MobilizationDetailPage />) },
      { path: 'campaigns', element: withSuspense(<CampaignsPage />) },
      {
        path: 'campaigns/new',
        element: withSuspense(
          <RequireAuth>
            <CampaignCreatePage />
          </RequireAuth>,
        ),
      },
      { path: 'campaigns/:slug', element: withSuspense(<CampaignDetailPage />) },
      {
        path: 'services',
        children: [
          { index: true, element: withSuspense(<ServicesHubPage />) },
          { path: 'housing', element: withSuspense(<HousingPage />) },
          {
            path: 'housing/new',
            element: withSuspense(
              <RequireAuth>
                <HousingCreatePage />
              </RequireAuth>,
            ),
          },
          { path: 'housing/:id', element: withSuspense(<HousingDetailPage />) },
          {
            path: 'housing/:id/request',
            element: withSuspense(
              <RequireAuth>
                <HousingRequestPage />
              </RequireAuth>,
            ),
          },
          { path: 'carpooling', element: withSuspense(<CarpoolingPage />) },
          {
            path: 'carpooling/new',
            element: withSuspense(
              <RequireAuth>
                <CarpoolingCreatePage />
              </RequireAuth>,
            ),
          },
          { path: 'carpooling/:id', element: withSuspense(<CarpoolingDetailPage />) },
          { path: 'marketplace', element: withSuspense(<MarketplacePage />) },
          {
            path: 'marketplace/new',
            element: withSuspense(
              <RequireAuth>
                <MarketplaceCreatePage />
              </RequireAuth>,
            ),
          },
          { path: 'marketplace/:id', element: withSuspense(<MarketplaceDetailPage />) },
          { path: 'lending', element: withSuspense(<LendingPage />) },
          {
            path: 'lending/new',
            element: withSuspense(
              <RequireAuth>
                <LendingCreatePage />
              </RequireAuth>,
            ),
          },
          { path: 'lending/:id', element: withSuspense(<LendingDetailPage />) },
          { path: 'garden', element: withSuspense(<GardenPage />) },
          {
            path: 'garden/new',
            element: withSuspense(
              <RequireAuth>
                <GardenCreatePage />
              </RequireAuth>,
            ),
          },
          { path: 'garden/:id', element: withSuspense(<GardenDetailPage />) },
          { path: 'sel', element: withSuspense(<SelPage />) },
          {
            path: 'sel/new',
            element: withSuspense(
              <RequireAuth>
                <SelCreatePage />
              </RequireAuth>,
            ),
          },
          { path: 'sel/:id', element: withSuspense(<SelDetailPage />) },
          { path: 'crowdfunding', element: withSuspense(<CrowdfundingPage />) },
          {
            path: 'crowdfunding/new',
            element: withSuspense(
              <RequireAuth>
                <CrowdfundingCreatePage />
              </RequireAuth>,
            ),
          },
          { path: 'crowdfunding/:id', element: withSuspense(<CrowdfundingDetailPage />) },
          {
            path: 'crowdfunding/:id/contribute',
            element: withSuspense(
              <RequireAuth>
                <CrowdfundingContributePage />
              </RequireAuth>,
            ),
          },
        ],
      },
      { path: 'media', element: withSuspense(<MediaPage />) },
      {
        path: 'media/new',
        element: withSuspense(
          <RequireAuth>
            <ArticleCreatePage />
          </RequireAuth>,
        ),
      },
      { path: 'media/:slug', element: withSuspense(<ArticleDetailPage />) },
      { path: 'reseau', element: withSuspense(<ReseauPage />) },
      { path: 'polls', element: withSuspense(<PollsPage />) },
      {
        path: 'polls/new',
        element: withSuspense(
          <RequireAuth>
            <PollCreatePage />
          </RequireAuth>,
        ),
      },
      { path: 'polls/:slug', element: withSuspense(<PollDetailPage />) },
      {
        path: 'messaging',
        element: withSuspense(
          <RequireAuth>
            <MessagingPage />
          </RequireAuth>,
        ),
      },
      {
        path: 'messaging/:conversationId',
        element: withSuspense(
          <RequireAuth>
            <MessagingConversationPage />
          </RequireAuth>,
        ),
      },
      {
        path: 'notifications',
        element: withSuspense(
          <RequireAuth>
            <NotificationsPage />
          </RequireAuth>,
        ),
      },
      {
        path: 'admin',
        element: withSuspense(
          <RequireAuth>
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          </RequireAuth>,
        ),
      },
      { path: 'join', element: withSuspense(<JoinPage />) },
      { path: 'communes', element: withSuspense(<CommunesPage />) },
      {
        path: 'communes/new',
        element: withSuspense(
          <RequireAuth>
            <RequireAdmin>
              <CommuneCreatePage />
            </RequireAdmin>
          </RequireAuth>,
        ),
      },
      { path: 'communes/:slug', element: withSuspense(<CommuneDetailPage />) },
      {
        path: 'profile',
        element: withSuspense(
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>,
        ),
      },
      { path: 'auth/reset-password', element: withSuspense(<ResetPasswordPage />) },
      { path: 'auth/callback', element: withSuspense(<AuthCallbackPage />) },
      {
        path: 'legal',
        children: [
          { path: 'privacy', element: withSuspense(<PrivacyPage />) },
          { path: 'notice', element: withSuspense(<LegalNoticePage />) },
          { path: 'cookies', element: withSuspense(<CookiesPage />) },
          { path: 'contact', element: withSuspense(<ContactPage />) },
        ],
      },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
]);
