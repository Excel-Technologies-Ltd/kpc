import PrivateGuard from '@/guards/PrivateGuard';
import MainLayout from '@/layout/main-layout';
import ErrorPage from '@/pages/error';
import ExecutiveCommand from '@/pages/home';
import OverviewPage from '@/pages/overview';
import PipelineFlow from '@/pages/pipeline-flow';
import type { RouteObject } from 'react-router-dom';

export const privateRoutes: RouteObject[] = [
  {
    path: '/',
    element: <PrivateGuard />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <MainLayout />,
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            element: <ExecutiveCommand />,
          },
          {
            path: 'pipeline-flow',
            element: <PipelineFlow />,
          },
          {
            path: 'stock-tank-farm',
            element: <OverviewPage />,
          },
          {
            path: 'loss-accountability',
            element: <OverviewPage />,
          },
          {
            path: 'commercial-revenue',
            element: <OverviewPage />,
          },
          {
            path: 'assets-eam',
            element: <OverviewPage />,
          },
          {
            path: 'hse-integrity',
            element: <OverviewPage />,
          },
          {
            path: 'reports/daily-throughput',
            element: <OverviewPage />,
          },
          {
            path: 'reports/stock-reconciliation',
            element: <OverviewPage />,
          },
          {
            path: 'reports/product-loss',
            element: <OverviewPage />,
          },
          {
            path: 'reports/tariff-revenue',
            element: <OverviewPage />,
          },
          {
            path: 'reports/hse-compliance',
            element: <OverviewPage />,
          },
          {
            path: '*',
            element: <ErrorPage />,
          },
        ],
      },
    ],
  },
];
