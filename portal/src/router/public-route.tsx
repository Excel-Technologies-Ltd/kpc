import PublicGuard from '@/guards/PublicGuard';
import ErrorPage from '@/pages/error';
import LoginPage from '@/pages/login';
import type { RouteObject } from 'react-router-dom';

export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <PublicGuard />,
    errorElement: <ErrorPage />,
    children: [{ path: 'login', element: <LoginPage /> }],
  },
];
