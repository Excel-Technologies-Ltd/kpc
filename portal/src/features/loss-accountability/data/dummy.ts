import type { FlowKpiCardProps } from '@/components/shared/FlowKpiCard';
import type { StatusTone } from '@/components/shared/StatusBadge';

export type LossKpi = Omit<FlowKpiCardProps, 'delay'>;

export const LOSS_KPIS: LossKpi[] = [
  {
    title: 'System loss MTD',
    value: '0.17',
    unit: '%',
    delta: '▼ below limit',
    deltaType: 'up',
    description: 'Network unaccounted-for volume vs throughput',
    color: '#f59e0b',
  },
  {
    title: 'Allowable',
    value: '0.20',
    unit: '%',
    delta: 'regulator ceiling',
    deltaType: 'flat',
    description: 'EPRA / internal tolerance band',
    color: '#4361ee',
  },
  {
    title: 'Volume unaccounted',
    value: '312',
    unit: 'm³',
    delta: 'under review',
    deltaType: 'down',
    description: 'Absolute loss volume month to date',
    color: '#ef4444',
  },
  {
    title: 'Segments in breach',
    value: '1',
    delta: 'Sultan Hamud leg',
    deltaType: 'down',
    description: 'Legs above tolerance this period',
    color: '#f43f5e',
  },
  {
    title: 'Recovered',
    value: '88',
    unit: 'm³',
    delta: 'this month',
    deltaType: 'up',
    description: 'Transmix / reprocess recovered volume',
    color: '#10b981',
  },
];

export const LOSS_HEATMAP = {
  segments: [
    'Mombasa–Maungu',
    'Maungu–Mtito',
    'Mtito–Sultan Hamud',
    'Sultan Hamud–Nairobi',
    'Nairobi–Nakuru',
  ],
  products: ['PMS', 'AGO', 'Jet', 'IK'],
  /** rows = segments, cols = products; values are loss % */
  data: [
    [0.09, 0.12, 0.07, 0.1],
    [0.11, 0.14, 0.09, 0.12],
    [0.15, 0.18, 0.13, 0.16],
    [0.22, 0.31, 0.19, 0.24],
    [0.08, 0.1, 0.06, 0.09],
  ],
};

export const LOSS_BY_CAUSE = {
  labels: ['Evaporation', 'Meter error', 'Measurement', 'Suspected theft'],
  values: [128, 74, 52, 58],
  colors: ['#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'],
};

export type SegmentRow = {
  segment: string;
  length: string;
  throughput: string;
  loss: string;
  lossPct: number;
  tolerance: number;
  cause: string;
  flag: string;
  tone: StatusTone;
};

export const SEGMENT_ROWS: SegmentRow[] = [
  {
    segment: 'Mombasa–Maungu',
    length: '98 km',
    throughput: '412,000',
    loss: '420',
    lossPct: 0.1,
    tolerance: 0.2,
    cause: 'Evaporation',
    flag: 'Within',
    tone: 'good',
  },
  {
    segment: 'Maungu–Mtito',
    length: '86 km',
    throughput: '398,000',
    loss: '478',
    lossPct: 0.12,
    tolerance: 0.2,
    cause: 'Measurement',
    flag: 'Within',
    tone: 'good',
  },
  {
    segment: 'Mtito–Sultan Hamud',
    length: '112 km',
    throughput: '372,000',
    loss: '595',
    lossPct: 0.16,
    tolerance: 0.2,
    cause: 'Meter error',
    flag: 'Watch',
    tone: 'warn',
  },
  {
    segment: 'Sultan Hamud–Nairobi',
    length: '104 km',
    throughput: '361,000',
    loss: '940',
    lossPct: 0.26,
    tolerance: 0.2,
    cause: 'Suspected theft',
    flag: 'Breach',
    tone: 'alarm',
  },
  {
    segment: 'Nairobi–Nakuru',
    length: '156 km',
    throughput: '188,000',
    loss: '160',
    lossPct: 0.09,
    tolerance: 0.2,
    cause: 'Evaporation',
    flag: 'Within',
    tone: 'good',
  },
];
