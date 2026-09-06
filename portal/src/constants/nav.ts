import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  ArrowUpRight,
  Calendar,
  Columns2,
  DollarSign,
  LayoutDashboard,
  Menu,
  Shield,
  SquareCheck,
  Sun,
  Timer,
  TrendingUp,
} from 'lucide-react';

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'MANAGEMENT',
    items: [
      { to: '/', label: 'Executive Command', icon: LayoutDashboard },
      { to: '/pipeline-flow', label: 'Pipeline Flow', icon: Activity },
      { to: '/stock-tank-farm', label: 'Stock & Tank Farm', icon: Columns2 },
      { to: '/commercial-revenue', label: 'Commercial & Revenue', icon: TrendingUp },
      { to: '/assets-eam', label: 'Assets & EAM', icon: Sun },
      { to: '/loss-accountability', label: 'Loss & Accountability', icon: Timer },
      { to: '/hse-integrity', label: 'HSE & Integrity', icon: Shield },
    ],
  },
  {
    title: 'REPORTS',
    items: [
      { to: '/reports/daily-throughput', label: 'Daily Throughput', icon: Calendar },
      { to: '/reports/stock-reconciliation', label: 'Stock & Reconciliation', icon: Menu },
      { to: '/reports/product-loss', label: 'Product Loss', icon: ArrowUpRight },
      { to: '/reports/tariff-revenue', label: 'Tariff Revenue', icon: DollarSign },
      { to: '/reports/hse-compliance', label: 'HSE & Compliance', icon: SquareCheck },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);
