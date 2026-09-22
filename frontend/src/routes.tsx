import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { LoginPage } from './pages/login/LoginPage';
import { VideosPage } from './pages/videos/VideosPage';
import { VideoDetailsPage } from './pages/videoDetails/VideoDetailsPage';
import { AdsPage } from './pages/ads/AdsPage';
import { AdDetailsPage } from './pages/adDetails/AdDetailsPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { PublicVideosPage } from './pages/publicVideos/PublicVideosPage';
import { PublicPlayerPage } from './pages/publicPlayer/PublicPlayerPage';
import { RequireAuth } from './features/auth/components/RequireAuth/RequireAuth';
import { RequireGuest } from './features/auth/components/RequireGuest/RequireGuest';
import { Routes } from './constants/routes.constants';

// `private` is our own flag, not a RouteObject field - a guard below walks this array and wraps
// every `private: true` route's element, instead of every route needing to remember to wrap
// itself individually.
type AppRoute = RouteObject & { private?: boolean };

const adminRoutes: AppRoute[] = [
  { path: Routes.VIDEOS, element: <VideosPage />, private: true },
  { path: Routes.VIDEO_DETAILS, element: <VideoDetailsPage />, private: true },
  { path: Routes.ADS, element: <AdsPage />, private: true },
  { path: Routes.AD_DETAILS, element: <AdDetailsPage />, private: true },
  { path: Routes.DASHBOARD, element: <DashboardPage />, private: true },
];

const guardedAdminRoutes: RouteObject[] = adminRoutes.map((route) => ({
  ...route,
  element: route.private ? <RequireAuth>{route.element}</RequireAuth> : route.element,
}));

const routes: AppRoute[] = [
  { path: Routes.HOME, element: <PublicVideosPage /> },
  { path: Routes.PLAY, element: <PublicPlayerPage /> },
  {
    path: Routes.LOGIN,
    element: (
      <RequireGuest>
        <LoginPage />
      </RequireGuest>
    ),
  },
  { element: <Layout />, children: guardedAdminRoutes },
];

export const router = createBrowserRouter(routes);
