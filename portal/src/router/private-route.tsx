import PrivateGuard from '@/guards/PrivateGuard';
import MainLayout from '@/layout/main-layout';
import OverviewPage from '@/pages/overview';
import { URLOverview } from '@/router/routes.url';
import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

export const privateRoutes: RouteObject[] = [
  {
    path: '/',
    element: <PrivateGuard />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <OverviewPage />,
          },
          {
            path: '*',
            element: <Navigate to={URLOverview()} replace />,
          },
        ],
      },
    ],
  },
];
