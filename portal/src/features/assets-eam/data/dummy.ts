import type { FlowKpiCardProps } from '@/components/shared/FlowKpiCard';
import type { StatusTone } from '@/components/shared/StatusBadge';

export type AssetsKpi = Omit<FlowKpiCardProps, 'delay'>;

export const ASSETS_KPIS: AssetsKpi[] = [
  {
    title: 'Assets monitored',
    value: '1,284',
    delta: 'pumps · valves · meters',
    deltaType: 'flat',
    description: 'Instrumented equipment across stations',
    color: '#4361ee',
  },
  {
    title: 'Open work orders',
    value: '23',
    delta: '4 high priority',
    deltaType: 'flat',
    description: 'Active maintenance queue',
    color: '#f59e0b',
  },
  {
    title: 'Overdue PM',
    value: '5',
    delta: 'schedule slip',
    deltaType: 'down',
    description: 'Preventive jobs past due date',
    color: '#ef4444',
  },
  {
    title: 'Fleet uptime',
    value: '98.6',
    unit: '%',
    delta: '▲ vs 97.9%',
    deltaType: 'up',
    description: 'Availability across critical rotating assets',
    color: '#10b981',
  },
  {
    title: 'MTBF',
    value: '1,420',
    unit: 'h',
    delta: 'improving',
    deltaType: 'up',
    description: 'Mean time between failures',
    color: '#06b6d4',
  },
];

export type WorkOrderPriority = 'hi' | 'med' | 'lo';

export type WorkOrder = {
  id: string;
  title: string;
  location: string;
  priority: WorkOrderPriority;
  priorityLabel: string;
};

export type KanbanColumn = {
  title: string;
  items: WorkOrder[];
};

export const WORK_ORDER_KANBAN: KanbanColumn[] = [
  {
    title: 'Open',
    items: [
      {
        id: 'WO-8841',
        title: 'Pump 2 mechanical seal leak',
        location: 'PS3',
        priority: 'hi',
        priorityLabel: 'High',
      },
      {
        id: 'WO-8846',
        title: 'Valve actuator slow response',
        location: 'Nairobi',
        priority: 'med',
        priorityLabel: 'Med',
      },
      {
        id: 'WO-8850',
        title: 'Flow meter recalibration',
        location: 'Kisumu',
        priority: 'lo',
        priorityLabel: 'Low',
      },
    ],
  },
  {
    title: 'In progress',
    items: [
      {
        id: 'WO-8832',
        title: 'Main pump bearing replacement',
        location: 'PS1',
        priority: 'hi',
        priorityLabel: 'High',
      },
      {
        id: 'WO-8839',
        title: 'SCADA RTU comms fault',
        location: 'PS4',
        priority: 'med',
        priorityLabel: 'Med',
      },
    ],
  },
  {
    title: 'Awaiting parts',
    items: [
      {
        id: 'WO-8815',
        title: 'VFD drive module',
        location: 'PS2',
        priority: 'med',
        priorityLabel: 'Med',
      },
      {
        id: 'WO-8820',
        title: 'Manifold gasket set',
        location: 'Nairobi',
        priority: 'lo',
        priorityLabel: 'Low',
      },
    ],
  },
  {
    title: 'Done',
    items: [
      {
        id: 'WO-8801',
        title: 'Strainer filter change',
        location: 'Nakuru',
        priority: 'lo',
        priorityLabel: 'Low',
      },
      {
        id: 'WO-8808',
        title: 'Pump coupling alignment',
        location: 'PS3',
        priority: 'med',
        priorityLabel: 'Med',
      },
    ],
  },
];

export const UPTIME_SERIES = {
  labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
  uptime: [97.4, 97.9, 97.6, 98.2, 97.9, 98.6],
  downtimeCost: [8.1, 6.9, 7.4, 5.8, 6.4, 4.2],
};

export type CriticalAsset = {
  assetId: string;
  location: string;
  health: number;
  openWo: number;
  lastPm: string;
  nextPm: string;
  uptime: string;
  status: string;
  tone: StatusTone;
};

export const CRITICAL_ASSETS: CriticalAsset[] = [
  {
    assetId: 'PS3-PUMP-02',
    location: 'Pump Stn 3',
    health: 42,
    openWo: 1,
    lastPm: '12 Jul',
    nextPm: '10 Aug',
    uptime: '96.1',
    status: 'Degraded',
    tone: 'alarm',
  },
  {
    assetId: 'PS1-PUMP-01',
    location: 'Pump Stn 1',
    health: 88,
    openWo: 0,
    lastPm: '28 Jul',
    nextPm: '26 Oct',
    uptime: '99.4',
    status: 'Running',
    tone: 'good',
  },
  {
    assetId: 'NRB-METER-04',
    location: 'Nairobi depot',
    health: 71,
    openWo: 1,
    lastPm: '02 Aug',
    nextPm: '02 Nov',
    uptime: '98.9',
    status: 'Running',
    tone: 'warn',
  },
  {
    assetId: 'PS4-RTU-01',
    location: 'Pump Stn 4',
    health: 55,
    openWo: 1,
    lastPm: '18 Jun',
    nextPm: '—',
    uptime: '94.2',
    status: 'Maintenance',
    tone: 'warn',
  },
  {
    assetId: 'PS2-VFD-03',
    location: 'Pump Stn 2',
    health: 63,
    openWo: 1,
    lastPm: '21 Jul',
    nextPm: '19 Oct',
    uptime: '97.7',
    status: 'Awaiting parts',
    tone: 'warn',
  },
  {
    assetId: 'NKU-VALVE-07',
    location: 'Nakuru',
    health: 91,
    openWo: 0,
    lastPm: '30 Jul',
    nextPm: '28 Oct',
    uptime: '99.8',
    status: 'Running',
    tone: 'good',
  },
];
