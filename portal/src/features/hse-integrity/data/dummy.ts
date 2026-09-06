import type { FlowKpiCardProps } from '@/components/shared/FlowKpiCard';
import type { StatusTone } from '@/components/shared/StatusBadge';

export type HseKpi = Omit<FlowKpiCardProps, 'delay'>;

export const HSE_KPIS: HseKpi[] = [
  {
    title: 'Days since LTI',
    value: '214',
    delta: '▲ record',
    deltaType: 'up',
    description: 'Days without a lost-time injury',
    color: '#10b981',
  },
  {
    title: 'Incidents MTD',
    value: '3',
    delta: 'all low sev',
    deltaType: 'flat',
    description: 'Recorded HSE events this month',
    color: '#f59e0b',
  },
  {
    title: 'Open actions',
    value: '6',
    delta: '2 past due',
    deltaType: 'down',
    description: 'Corrective actions still open',
    color: '#ef4444',
  },
  {
    title: 'LTIFR',
    value: '0.41',
    delta: '▼ improving',
    deltaType: 'up',
    description: 'Lost-time injury frequency rate',
    color: '#4361ee',
  },
  {
    title: 'Cathodic protection',
    value: '98',
    unit: '%',
    delta: 'healthy',
    deltaType: 'up',
    description: 'Pipeline CP system coverage',
    color: '#06b6d4',
  },
];

export const ROUTE_STATIONS: { name: string; x: number }[] = [
  { name: 'Mombasa', x: 40 },
  { name: 'Mtito', x: 175 },
  { name: 'Sultan Hamud', x: 320 },
  { name: 'Nairobi', x: 460 },
  { name: 'Nakuru', x: 580 },
];

export const ROUTE_INCIDENTS: { x: number; color: string; r: number }[] = [
  { x: 205, color: '#f59e0b', r: 8 },
  { x: 335, color: '#ef4444', r: 12 },
  { x: 475, color: '#06b6d4', r: 6 },
];

export const INCIDENTS_BY_TYPE = {
  labels: ['Spill', 'Near-miss', 'Injury', 'Fire', 'Env'],
  low: [1, 4, 2, 0, 1],
  medium: [1, 2, 1, 1, 0],
  high: [1, 0, 0, 0, 0],
};

export type IncidentRow = {
  ref: string;
  date: string;
  location: string;
  type: string;
  severity: string;
  severityTone: StatusTone;
  volumeLost: string;
  action: string;
  status: string;
  statusTone: StatusTone;
};

export const INCIDENT_ROWS: IncidentRow[] = [
  {
    ref: 'HSE-1042',
    date: '29 Aug',
    location: 'Sultan Hamud',
    type: 'Spill',
    severity: 'High',
    severityTone: 'alarm',
    volumeLost: '12 m³',
    action: 'Clamp + soil remediation',
    status: 'In progress',
    statusTone: 'warn',
  },
  {
    ref: 'HSE-1041',
    date: '24 Aug',
    location: 'Mtito Andei',
    type: 'Near-miss',
    severity: 'Low',
    severityTone: 'good',
    volumeLost: '—',
    action: 'Toolbox talk logged',
    status: 'Closed',
    statusTone: 'good',
  },
  {
    ref: 'HSE-1039',
    date: '18 Aug',
    location: 'Nairobi depot',
    type: 'Injury',
    severity: 'Medium',
    severityTone: 'warn',
    volumeLost: '—',
    action: 'Guard rail installed',
    status: 'Closed',
    statusTone: 'good',
  },
  {
    ref: 'HSE-1037',
    date: '11 Aug',
    location: 'Pump Stn 2',
    type: 'Near-miss',
    severity: 'Low',
    severityTone: 'good',
    volumeLost: '—',
    action: 'LOTO retraining',
    status: 'In progress',
    statusTone: 'info',
  },
  {
    ref: 'HSE-1034',
    date: '03 Aug',
    location: 'Mombasa',
    type: 'Environmental',
    severity: 'Low',
    severityTone: 'good',
    volumeLost: '—',
    action: 'Bund inspection',
    status: 'Closed',
    statusTone: 'good',
  },
];
