import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { VideosPage } from './pages/VideosPage';
import { AdManagementPage } from './pages/AdManagementPage';
import { DashboardPage } from './pages/DashboardPage';
import { PublicPlayerPage } from './pages/PublicPlayerPage';

// `private` is our own flag, not a RouteObject field - once AuthContext/RequireAuth exist, a
// guard can walk this array and wrap every `private: true` route's element, instead of every
// route needing to remember to wrap itself individually.
type AppRoute = RouteObject & { private?: boolean };

const adminRoutes: AppRoute[] = [
  { path: '/videos', element: <VideosPage />, private: true },
  { path: '/ads', element: <AdManagementPage />, private: true },
  { path: '/dashboard', element: <DashboardPage />, private: true },
];

const routes: AppRoute[] = [
  { path: '/login', element: <LoginPage /> },
  { path: '/play/:videoId', element: <PublicPlayerPage /> },
  { element: <Layout />, children: adminRoutes },
  { path: '/', element: <Navigate to="/videos" replace /> },
];

export const router = createBrowserRouter(routes);
