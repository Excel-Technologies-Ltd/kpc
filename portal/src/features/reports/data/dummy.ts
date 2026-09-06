import type { StatusTone } from '@/components/shared/StatusBadge';
import {
  URLReportDailyThroughput,
  URLReportHseCompliance,
  URLReportProductLoss,
  URLReportStockReconciliation,
  URLReportTariffRevenue,
} from '@/router/routes.url';

export type ReportNavItem = {
  to: string;
  label: string;
  key: string;
};

export const REPORT_NAV: ReportNavItem[] = [
  { key: 'through', to: URLReportDailyThroughput(), label: 'Daily Throughput' },
  { key: 'stock', to: URLReportStockReconciliation(), label: 'Stock & Reconciliation' },
  { key: 'loss', to: URLReportProductLoss(), label: 'Product Loss' },
  { key: 'rev', to: URLReportTariffRevenue(), label: 'Tariff Revenue' },
  { key: 'hse', to: URLReportHseCompliance(), label: 'HSE & Compliance' },
];

export type ReportSummary = {
  label: string;
  value: string;
  delta: string;
  tone: 'blue' | 'green' | 'amber' | 'rose';
};

export type ReportTool = {
  id: string;
  label: string;
  primary?: boolean;
};

export type ReportMeta = {
  title: string;
  subtitle: string;
  freshness: string;
  aiNote: string;
  tools: ReportTool[];
  summaries: ReportSummary[];
};

export const THROUGHPUT_REPORT: ReportMeta = {
  title: 'Daily Throughput Report',
  subtitle: 'Volume moved per line and product, planned vs actual',
  freshness: 'Live · as of 06:00',
  aiNote:
    'Throughput is 6.2% ahead of plan. One leg, Nakuru→Kisumu (AGO), is running 8% below plan and is worth watching.',
  tools: [
    { id: 'ask', label: 'Ask assistant' },
    { id: 'cols', label: 'Columns' },
    { id: 'excel', label: 'Excel' },
    { id: 'pdf', label: 'PDF' },
  ],
  summaries: [
    { label: 'Total throughput', value: '18,420 m³', delta: '▲ 6.2% vs plan', tone: 'blue' },
    { label: 'Plan attainment', value: '106%', delta: 'ahead', tone: 'green' },
    { label: 'Avg flow rate', value: '1,180 m³/h', delta: 'steady', tone: 'amber' },
    { label: 'Cumulative MTD', value: '34,110 m³', delta: '2-day total', tone: 'blue' },
  ],
};

export type ThroughputRow = {
  line: string;
  route: string;
  product: string;
  planned: string;
  actual: string;
  variance: string;
  varianceUp: boolean;
  attain: string;
  status: string;
  tone: StatusTone;
};

export const THROUGHPUT_ROWS: ThroughputRow[] = [
  {
    line: 'Line 1',
    route: 'Mombasa → Nairobi',
    product: 'PMS',
    planned: '4,800',
    actual: '5,120',
    variance: '+320',
    varianceUp: true,
    attain: '107%',
    status: 'On track',
    tone: 'good',
  },
  {
    line: 'Line 5',
    route: 'Mombasa → Nairobi',
    product: 'AGO',
    planned: '4,200',
    actual: '4,410',
    variance: '+210',
    varianceUp: true,
    attain: '105%',
    status: 'On track',
    tone: 'good',
  },
  {
    line: 'Line 1',
    route: 'Mombasa → Nairobi',
    product: 'Jet A-1',
    planned: '2,000',
    actual: '1,980',
    variance: '-20',
    varianceUp: false,
    attain: '99%',
    status: 'Nominal',
    tone: 'info',
  },
  {
    line: 'Line 2',
    route: 'Nairobi → Nakuru',
    product: 'PMS',
    planned: '2,600',
    actual: '2,740',
    variance: '+140',
    varianceUp: true,
    attain: '105%',
    status: 'On track',
    tone: 'good',
  },
  {
    line: 'Line 4',
    route: 'Nakuru → Kisumu',
    product: 'AGO',
    planned: '1,800',
    actual: '1,650',
    variance: '-150',
    varianceUp: false,
    attain: '92%',
    status: 'Below plan',
    tone: 'warn',
  },
  {
    line: 'Line 3',
    route: 'Nakuru → Eldoret',
    product: 'IK',
    planned: '1,000',
    actual: '1,120',
    variance: '+120',
    varianceUp: true,
    attain: '112%',
    status: 'On track',
    tone: 'good',
  },
];

export const THROUGHPUT_FOOT = {
  planned: '16,400',
  actual: '17,020',
  variance: '+620',
  attain: '104%',
};

export const STOCK_REPORT: ReportMeta = {
  title: 'Stock Position & Reconciliation Report',
  subtitle: 'Tank capacity, book vs physical stock and ullage — Nairobi depot',
  freshness: 'Live · dip 06:00',
  aiNote:
    'Tank T06 (Jet) is at 96%, a high-level alarm. T03 (AGO) variance of -0.33% is on watch. Everything else is within tolerance.',
  tools: [
    { id: 'ask', label: 'Ask assistant' },
    { id: 'cols', label: 'Columns' },
    { id: 'excel', label: 'Excel' },
    { id: 'pdf', label: 'PDF' },
  ],
  summaries: [
    { label: 'Total physical stock', value: '128.6k m³', delta: '8 tanks', tone: 'green' },
    { label: 'Available ullage', value: '47.4k m³', delta: 'room to receive', tone: 'blue' },
    { label: 'Net variance', value: '-58 m³', delta: 'within tolerance', tone: 'amber' },
    { label: 'Tanks in alarm', value: '1', delta: 'NRB-T06', tone: 'rose' },
  ],
};

export type StockRow = {
  tank: string;
  product: string;
  capacity: string;
  book: string;
  physical: string;
  variance: string;
  varPct: string;
  ullage: string;
  status: string;
  tone: StatusTone;
};

export const STOCK_ROWS: StockRow[] = [
  {
    tank: 'NRB-T01',
    product: 'PMS',
    capacity: '30,000',
    book: '24,610',
    physical: '24,588',
    variance: '-22',
    varPct: '-0.09%',
    ullage: '5,412',
    status: 'Normal',
    tone: 'good',
  },
  {
    tank: 'NRB-T02',
    product: 'PMS',
    capacity: '30,000',
    book: '16,240',
    physical: '16,251',
    variance: '+11',
    varPct: '+0.07%',
    ullage: '13,749',
    status: 'Normal',
    tone: 'good',
  },
  {
    tank: 'NRB-T03',
    product: 'AGO',
    capacity: '25,000',
    book: '17,800',
    physical: '17,742',
    variance: '-58',
    varPct: '-0.33%',
    ullage: '7,258',
    status: 'Watch',
    tone: 'warn',
  },
  {
    tank: 'NRB-T04',
    product: 'AGO',
    capacity: '25,000',
    book: '8,300',
    physical: '8,296',
    variance: '-4',
    varPct: '-0.05%',
    ullage: '16,704',
    status: 'Normal',
    tone: 'good',
  },
  {
    tank: 'NRB-T05',
    product: 'Jet A-1',
    capacity: '20,000',
    book: '12,010',
    physical: '12,010',
    variance: '0',
    varPct: '0.00%',
    ullage: '7,990',
    status: 'Normal',
    tone: 'good',
  },
  {
    tank: 'NRB-T06',
    product: 'Jet A-1',
    capacity: '20,000',
    book: '19,180',
    physical: '19,205',
    variance: '+25',
    varPct: '+0.13%',
    ullage: '795',
    status: 'High level',
    tone: 'alarm',
  },
  {
    tank: 'NRB-T07',
    product: 'IK',
    capacity: '15,000',
    book: '6,720',
    physical: '6,710',
    variance: '-10',
    varPct: '-0.15%',
    ullage: '8,290',
    status: 'Normal',
    tone: 'good',
  },
];

export const STOCK_FOOT = {
  capacity: '165,000',
  book: '104,660',
  physical: '104,602',
  variance: '-58',
  varPct: '-0.06%',
  ullage: '47,398',
};

export const LOSS_REPORT: ReportMeta = {
  title: 'Product Loss / Unaccounted-For Report',
  subtitle: 'Losses by pipeline segment against allowable tolerance',
  freshness: 'Live · MTD',
  aiNote:
    "Sultan Hamud→Nairobi breached tolerance at 0.26% (suspected theft). I've already drafted the EPRA loss return — use the green button to export it.",
  tools: [
    { id: 'epra', label: 'Export EPRA return', primary: true },
    { id: 'ask', label: 'Ask assistant' },
    { id: 'cols', label: 'Columns' },
    { id: 'excel', label: 'Excel' },
    { id: 'pdf', label: 'PDF' },
  ],
  summaries: [
    { label: 'System loss %', value: '0.17%', delta: '▼ below 0.20%', tone: 'amber' },
    { label: 'Volume unaccounted', value: '312 m³', delta: 'under review', tone: 'rose' },
    { label: 'Segments in breach', value: '1', delta: 'Sultan Hamud', tone: 'rose' },
    { label: 'Recovered', value: '88 m³', delta: 'transmix reprocess', tone: 'green' },
  ],
};

export type LossReportRow = {
  segment: string;
  length: string;
  throughput: string;
  loss: string;
  lossPct: number;
  barPct: number;
  cause: string;
  flag: string;
  tone: StatusTone;
};

export const LOSS_REPORT_ROWS: LossReportRow[] = [
  {
    segment: 'Mombasa–Maungu',
    length: '98 km',
    throughput: '412,000',
    loss: '420',
    lossPct: 0.1,
    barPct: 50,
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
    barPct: 60,
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
    barPct: 80,
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
    barPct: 100,
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
    barPct: 45,
    cause: 'Evaporation',
    flag: 'Within',
    tone: 'good',
  },
];

export const REVENUE_REPORT: ReportMeta = {
  title: 'Tariff Revenue & OMC Billing Report',
  subtitle: 'Throughput billed to Oil Marketing Companies, with receivables',
  freshness: 'Live · Aug 2026',
  aiNote:
    'KES 96M is 90+ days overdue, concentrated in Hass and Galana. That is the collections priority this week.',
  tools: [
    { id: 'ask', label: 'Ask assistant' },
    { id: 'cols', label: 'Columns' },
    { id: 'excel', label: 'Excel' },
    { id: 'pdf', label: 'PDF' },
  ],
  summaries: [
    { label: 'Revenue billed', value: 'KES 842M', delta: '▲ 4.1%', tone: 'green' },
    { label: 'Collected', value: 'KES 511M', delta: '61%', tone: 'blue' },
    { label: 'Outstanding', value: 'KES 611M', delta: 'all invoices', tone: 'amber' },
    { label: 'Overdue 90+', value: 'KES 96M', delta: 'cash at risk', tone: 'rose' },
  ],
};

export type RevenueReportRow = {
  customer: string;
  volume: string;
  tariff: string;
  invoiced: string;
  paid: string;
  outstanding: string;
  aging: string;
  status: string;
  tone: StatusTone;
};

export const REVENUE_REPORT_ROWS: RevenueReportRow[] = [
  {
    customer: 'Vivo Energy',
    volume: '4,120',
    tariff: '48',
    invoiced: '198',
    paid: '198',
    outstanding: '0',
    aging: '—',
    status: 'Current',
    tone: 'good',
  },
  {
    customer: 'TotalEnergies KE',
    volume: '3,880',
    tariff: '46',
    invoiced: '179',
    paid: '134',
    outstanding: '45',
    aging: '31–60',
    status: 'Due',
    tone: 'info',
  },
  {
    customer: 'Rubis Energy',
    volume: '3,210',
    tariff: '45',
    invoiced: '144',
    paid: '144',
    outstanding: '0',
    aging: '—',
    status: 'Current',
    tone: 'good',
  },
  {
    customer: 'Ola Energy',
    volume: '2,640',
    tariff: '44',
    invoiced: '116',
    paid: '62',
    outstanding: '54',
    aging: '61–90',
    status: 'Due',
    tone: 'warn',
  },
  {
    customer: 'Hass Petroleum',
    volume: '1,980',
    tariff: '43',
    invoiced: '85',
    paid: '0',
    outstanding: '85',
    aging: '90+',
    status: 'Overdue',
    tone: 'alarm',
  },
  {
    customer: 'Galana Oil',
    volume: '1,540',
    tariff: '42',
    invoiced: '65',
    paid: '25',
    outstanding: '40',
    aging: '90+',
    status: 'On hold',
    tone: 'alarm',
  },
  {
    customer: 'KenolKobil',
    volume: '1,342',
    tariff: '45',
    invoiced: '60',
    paid: '60',
    outstanding: '0',
    aging: '—',
    status: 'Current',
    tone: 'good',
  },
];

export const HSE_REPORT: ReportMeta = {
  title: 'HSE & Compliance Report',
  subtitle: 'Safety performance, incidents and corrective actions',
  freshness: 'Live · Aug 2026',
  aiNote:
    'One reportable spill (12 m³) at Sultan Hamud is above the NEMA threshold. Corrective action is in progress; the NEMA report is ready to export.',
  tools: [
    { id: 'nema', label: 'Export NEMA report', primary: true },
    { id: 'ask', label: 'Ask assistant' },
    { id: 'cols', label: 'Columns' },
    { id: 'excel', label: 'Excel' },
    { id: 'pdf', label: 'PDF' },
  ],
  summaries: [
    { label: 'Days since LTI', value: '214', delta: '▲ record', tone: 'green' },
    { label: 'LTIFR', value: '0.41', delta: '▼ improving', tone: 'blue' },
    { label: 'Incidents MTD', value: '3', delta: 'all low sev', tone: 'amber' },
    { label: 'Open actions', value: '6', delta: '2 past due', tone: 'rose' },
  ],
};

export type ComplianceRow = {
  requirement: string;
  owner: string;
  due: string;
  status: string;
  tone: StatusTone;
};

export const COMPLIANCE_ROWS: ComplianceRow[] = [
  {
    requirement: 'EPRA quarterly loss return',
    owner: 'Loss Control',
    due: '15 Sep',
    status: 'In progress',
    tone: 'info',
  },
  {
    requirement: 'Pipeline integrity (pigging) run',
    owner: 'Integrity',
    due: '28 Sep',
    status: 'Scheduled',
    tone: 'warn',
  },
  {
    requirement: 'Cathodic protection survey',
    owner: 'Corrosion',
    due: '10 Sep',
    status: 'Complete',
    tone: 'good',
  },
  {
    requirement: 'NEMA environmental audit',
    owner: 'Compliance',
    due: '30 Sep',
    status: 'Scheduled',
    tone: 'warn',
  },
];
