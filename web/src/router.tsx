import { createBrowserRouter } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import RootLayout from './layouts/RootLayout';
import HomePage from './pages/HomePage';
import PetitionsPage from './pages/PetitionsPage';
import PetitionDetailPage from './pages/PetitionDetailPage';
import PetitionCreatePage from './pages/PetitionCreatePage';
import MobilizationsPage from './pages/MobilizationsPage';
import MobilizationDetailPage from './pages/MobilizationDetailPage';
import MobilizationCreatePage from './pages/MobilizationCreatePage';
import CampaignsPage from './pages/CampaignsPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import CampaignCreatePage from './pages/CampaignCreatePage';
import ServicesHubPage from './pages/services/ServicesHubPage';
import HousingPage from './pages/services/HousingPage';
import HousingDetailPage from './pages/services/HousingDetailPage';
import HousingCreatePage from './pages/services/HousingCreatePage';
import HousingRequestPage from './pages/services/HousingRequestPage';
import CarpoolingPage from './pages/services/CarpoolingPage';
import CarpoolingDetailPage from './pages/services/CarpoolingDetailPage';
import CarpoolingCreatePage from './pages/services/CarpoolingCreatePage';
import MarketplacePage from './pages/services/MarketplacePage';
import LendingPage from './pages/services/LendingPage';
import GardenPage from './pages/services/GardenPage';
import SelPage from './pages/services/SelPage';
import CrowdfundingPage from './pages/services/CrowdfundingPage';
import MediaPage from './pages/MediaPage';
import ReseauPage from './pages/ReseauPage';
import PollsPage from './pages/PollsPage';
import PollDetailPage from './pages/PollDetailPage';
import PollCreatePage from './pages/PollCreatePage';
import MessagingPage from './pages/MessagingPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';
import JoinPage from './pages/JoinPage';
import CommunesPage from './pages/CommunesPage';
import ProfilePage from './pages/ProfilePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import PrivacyPage from './pages/PrivacyPage';
import LegalNoticePage from './pages/LegalNoticePage';
import CookiesPage from './pages/CookiesPage';
import NotFoundPage from './pages/NotFoundPage';

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
          { path: 'lending', element: <LendingPage /> },
          { path: 'garden', element: <GardenPage /> },
          { path: 'sel', element: <SelPage /> },
          { path: 'crowdfunding', element: <CrowdfundingPage /> },
        ],
      },
      { path: 'media', element: <MediaPage /> },
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
      { path: 'messaging', element: <MessagingPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'admin', element: <AdminPage /> },
      { path: 'join', element: <JoinPage /> },
      { path: 'communes', element: <CommunesPage /> },
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
      {
        path: 'legal',
        children: [
          { path: 'privacy', element: <PrivacyPage /> },
          { path: 'notice', element: <LegalNoticePage /> },
          { path: 'cookies', element: <CookiesPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
