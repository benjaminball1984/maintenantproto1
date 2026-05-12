import { createBrowserRouter } from 'react-router-dom';
import RequireAdmin from './components/RequireAdmin';
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
import MarketplaceDetailPage from './pages/services/MarketplaceDetailPage';
import MarketplaceCreatePage from './pages/services/MarketplaceCreatePage';
import LendingPage from './pages/services/LendingPage';
import LendingDetailPage from './pages/services/LendingDetailPage';
import LendingCreatePage from './pages/services/LendingCreatePage';
import GardenPage from './pages/services/GardenPage';
import GardenDetailPage from './pages/services/GardenDetailPage';
import GardenCreatePage from './pages/services/GardenCreatePage';
import SelPage from './pages/services/SelPage';
import SelDetailPage from './pages/services/SelDetailPage';
import SelCreatePage from './pages/services/SelCreatePage';
import CrowdfundingPage from './pages/services/CrowdfundingPage';
import CrowdfundingDetailPage from './pages/services/CrowdfundingDetailPage';
import CrowdfundingCreatePage from './pages/services/CrowdfundingCreatePage';
import CrowdfundingContributePage from './pages/services/CrowdfundingContributePage';
import MediaPage from './pages/MediaPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import ArticleCreatePage from './pages/ArticleCreatePage';
import ReseauPage from './pages/ReseauPage';
import PollsPage from './pages/PollsPage';
import PollDetailPage from './pages/PollDetailPage';
import PollCreatePage from './pages/PollCreatePage';
import MessagingPage from './pages/MessagingPage';
import MessagingConversationPage from './pages/MessagingConversationPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';
import JoinPage from './pages/JoinPage';
import CommunesPage from './pages/CommunesPage';
import CommuneDetailPage from './pages/CommuneDetailPage';
import CommuneCreatePage from './pages/CommuneCreatePage';
import ContactPage from './pages/ContactPage';
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
