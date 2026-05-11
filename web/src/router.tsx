import { createBrowserRouter } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import RootLayout from './layouts/RootLayout';
import HomePage from './pages/HomePage';
import PetitionsPage from './pages/PetitionsPage';
import MobilizationsPage from './pages/MobilizationsPage';
import CampaignsPage from './pages/CampaignsPage';
import ServicesHubPage from './pages/services/ServicesHubPage';
import HousingPage from './pages/services/HousingPage';
import CarpoolingPage from './pages/services/CarpoolingPage';
import MarketplacePage from './pages/services/MarketplacePage';
import LendingPage from './pages/services/LendingPage';
import GardenPage from './pages/services/GardenPage';
import SelPage from './pages/services/SelPage';
import CrowdfundingPage from './pages/services/CrowdfundingPage';
import MediaPage from './pages/MediaPage';
import ReseauPage from './pages/ReseauPage';
import PollsPage from './pages/PollsPage';
import MessagingPage from './pages/MessagingPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';
import JoinPage from './pages/JoinPage';
import CommunesPage from './pages/CommunesPage';
import ProfilePage from './pages/ProfilePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'petitions', element: <PetitionsPage /> },
      { path: 'mobilizations', element: <MobilizationsPage /> },
      { path: 'campaigns', element: <CampaignsPage /> },
      {
        path: 'services',
        children: [
          { index: true, element: <ServicesHubPage /> },
          { path: 'housing', element: <HousingPage /> },
          { path: 'carpooling', element: <CarpoolingPage /> },
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
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
