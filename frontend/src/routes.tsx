import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { LoginPage } from './pages/login/LoginPage';
import { VideosPage } from './pages/videos/VideosPage';
import { VideoDetailsPage } from './pages/videoDetails/VideoDetailsPage';
import { AdManagementPage } from './pages/adManagement/AdManagementPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { Routes } from './constants/routes.constants';

// `private` is our own flag, not a RouteObject field - once AuthContext/RequireAuth exist, a
// guard can walk this array and wrap every `private: true` route's element, instead of every
// route needing to remember to wrap itself individually.
type AppRoute = RouteObject & { private?: boolean };

const adminRoutes: AppRoute[] = [
  { path: Routes.VIDEOS, element: <VideosPage />, private: true },
  { path: Routes.VIDEO_DETAILS, element: <VideoDetailsPage />, private: true },
  { path: Routes.ADS, element: <AdManagementPage />, private: true },
  { path: Routes.DASHBOARD, element: <DashboardPage />, private: true },
];

const routes: AppRoute[] = [
  { path: Routes.LOGIN, element: <LoginPage /> },
  { element: <Layout />, children: adminRoutes },
  { path: '/', element: <Navigate to={Routes.VIDEOS} replace /> },
];

export const router = createBrowserRouter(routes);
