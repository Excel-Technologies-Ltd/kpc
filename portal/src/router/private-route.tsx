import PrivateGuard from '@/guards/PrivateGuard';
import MainLayout from '@/layout/main-layout';
import AssetsEam from '@/pages/assets-eam';
import CommercialRevenue from '@/pages/commercial-revenue';
import ErrorPage from '@/pages/error';
import ExecutiveCommand from '@/pages/home';
import HseIntegrity from '@/pages/hse-integrity';
import LossAccountability from '@/pages/loss-accountability';
import PipelineFlow from '@/pages/pipeline-flow';
import DailyThroughputReport from '@/pages/reports/daily-throughput';
import HseComplianceReport from '@/pages/reports/hse-compliance';
import ProductLossReport from '@/pages/reports/product-loss';
import StockReconciliationReport from '@/pages/reports/stock-reconciliation';
import TariffRevenueReport from '@/pages/reports/tariff-revenue';
import StockTankFarmPage from '@/pages/stock-tank-farm';
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
            element: <StockTankFarmPage />,
          },
          {
            path: 'loss-accountability',
            element: <LossAccountability />,
          },
          {
            path: 'commercial-revenue',
            element: <CommercialRevenue />,
          },
          {
            path: 'assets-eam',
            element: <AssetsEam />,
          },
          {
            path: 'hse-integrity',
            element: <HseIntegrity />,
          },
          {
            path: 'reports/daily-throughput',
            element: <DailyThroughputReport />,
          },
          {
            path: 'reports/stock-reconciliation',
            element: <StockReconciliationReport />,
          },
          {
            path: 'reports/product-loss',
            element: <ProductLossReport />,
          },
          {
            path: 'reports/tariff-revenue',
            element: <TariffRevenueReport />,
          },
          {
            path: 'reports/hse-compliance',
            element: <HseComplianceReport />,
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
