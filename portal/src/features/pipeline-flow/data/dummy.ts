export const PRODUCT_COLORS = {
  pms: '#f59e0b',
  ago: '#10b981',
  jet: '#8b5cf6',
  ik: '#0ea5e9',
} as const;

export type ProductKey = keyof typeof PRODUCT_COLORS;

export type FlowKpi = {
  id: string;
  title: string;
  value: string;
  unit?: string;
  delta: string;
  deltaType: 'up' | 'down' | 'flat';
  description: string;
  color: string;
};

export const FLOW_KPIS: FlowKpi[] = [
  {
    id: 'throughput',
    title: 'Throughput today',
    value: '18,420',
    unit: 'm³',
    delta: '▲ 6.2% vs plan',
    deltaType: 'up',
    description: 'Volume moved today across the trunk line',
    color: '#4361ee',
  },
  {
    id: 'flow-rate',
    title: 'Avg flow rate',
    value: '1,180',
    unit: 'm³/h',
    delta: 'steady',
    deltaType: 'flat',
    description: 'Average pumping rate over the shift',
    color: '#06b6d4',
  },
  {
    id: 'batches',
    title: 'Active batches',
    value: '7',
    delta: '2 interface watch',
    deltaType: 'flat',
    description: 'Batches currently in the line',
    color: '#f59e0b',
  },
  {
    id: 'line-pack',
    title: 'Line pack',
    value: '41,900',
    unit: 'm³',
    delta: 'nominal',
    deltaType: 'flat',
    description: 'Product volume physically inside the pipe',
    color: '#8b5cf6',
  },
  {
    id: 'plan',
    title: 'Plan attainment',
    value: '106',
    unit: '%',
    delta: 'ahead',
    deltaType: 'up',
    description: 'Actual throughput ÷ planned throughput',
    color: '#10b981',
  },
];

export type FlowDestination = {
  name: string;
  y: number;
  strokeWidth: number;
  product: ProductKey;
};

export const FLOW_DESTINATIONS: FlowDestination[] = [
  { name: 'Nairobi', y: 45, strokeWidth: 15, product: 'pms' },
  { name: 'Nakuru', y: 105, strokeWidth: 10, product: 'ago' },
  { name: 'Kisumu', y: 160, strokeWidth: 6, product: 'jet' },
  { name: 'Eldoret', y: 210, strokeWidth: 5, product: 'ik' },
];

export const LINE_FILL_PERCENT = 71;

export type PumpStatus = 'run' | 'standby' | 'fault';

export type PumpStation = {
  name: string;
  pressure: string;
  status: PumpStatus;
};

export const PUMP_STATIONS: PumpStation[] = [
  { name: 'PS1 Mombasa', pressure: '48 bar', status: 'run' },
  { name: 'PS2 Maungu', pressure: '44 bar', status: 'run' },
  { name: 'PS3 Mtito', pressure: '—', status: 'fault' },
  { name: 'PS4 S.Hamud', pressure: '41 bar', status: 'run' },
  { name: 'PS5 Nairobi', pressure: 'standby', status: 'standby' },
];

export type BatchStatus = 'Delivered' | 'Pumping' | 'Scheduled' | 'Interface';

export type ActiveBatch = {
  id: string;
  productKey: ProductKey;
  product: string;
  route: string;
  volume: string;
  injected: string;
  linePosition: string;
  eta: string;
  status: BatchStatus;
};

export const ACTIVE_BATCHES: ActiveBatch[] = [
  {
    id: 'B-2041',
    productKey: 'pms',
    product: 'PMS',
    route: 'Mombasa → Nairobi',
    volume: '9,200',
    injected: '9,200',
    linePosition: '—',
    eta: 'done',
    status: 'Delivered',
  },
  {
    id: 'B-2042',
    productKey: 'ago',
    product: 'AGO',
    route: 'Mombasa → Nakuru',
    volume: '6,400',
    injected: '4,100',
    linePosition: 'Sultan Hamud',
    eta: '04:20',
    status: 'Pumping',
  },
  {
    id: 'B-2043',
    productKey: 'jet',
    product: 'Jet A-1',
    route: 'Mombasa → Kisumu',
    volume: '3,000',
    injected: '1,650',
    linePosition: 'Mtito Andei',
    eta: '07:55',
    status: 'Pumping',
  },
  {
    id: 'B-2044',
    productKey: 'pms',
    product: 'PMS',
    route: 'Mombasa → Nairobi',
    volume: '8,800',
    injected: '0',
    linePosition: '—',
    eta: '10:30',
    status: 'Scheduled',
  },
  {
    id: 'B-2045',
    productKey: 'ik',
    product: 'IK',
    route: 'Mombasa → Eldoret',
    volume: '2,400',
    injected: '2,400',
    linePosition: 'Nakuru',
    eta: '—',
    status: 'Interface',
  },
  {
    id: 'B-2046',
    productKey: 'ago',
    product: 'AGO',
    route: 'Mombasa → Nairobi',
    volume: '7,100',
    injected: '7,100',
    linePosition: 'Nairobi',
    eta: 'done',
    status: 'Delivered',
  },
  {
    id: 'B-2047',
    productKey: 'pms',
    product: 'PMS',
    route: 'Mombasa → Nakuru',
    volume: '5,600',
    injected: '980',
    linePosition: 'Maungu',
    eta: '09:10',
    status: 'Pumping',
  },
];

export type InfoGuideKey = 'flow-kpi' | 'flow-sankey' | 'flow-ps' | 'flow-batch';

export type InfoGuideItem = {
  term: string;
  definition: string;
  source: string;
};

export type InfoGuide = {
  title: string;
  items: InfoGuideItem[];
};

export const INFO_GUIDES: Record<InfoGuideKey, InfoGuide> = {
  'flow-kpi': {
    title: 'Flow KPIs',
    items: [
      {
        term: 'Throughput today',
        definition: 'Volume moved today across the trunk line.',
        source: 'Custody meters at injection/delivery points',
      },
      {
        term: 'Avg flow rate',
        definition: 'Average pumping rate over the shift, m³ per hour.',
        source: 'SCADA flow meters',
      },
      {
        term: 'Active batches',
        definition: 'Count of product batches currently in the line.',
        source: 'Batch tracking / scheduling module',
      },
      {
        term: 'Line pack',
        definition: 'Volume of product physically inside the pipe now.',
        source: 'Pressure-volume model',
      },
      {
        term: 'Plan attainment',
        definition: 'Actual throughput ÷ planned throughput.',
        source: 'Scheduling module vs actuals',
      },
    ],
  },
  'flow-sankey': {
    title: 'Product flow diagram',
    items: [
      {
        term: 'Stream width',
        definition: 'Proportional to volume moving from source to that depot right now.',
        source: 'Real-time flow allocation per batch/destination',
      },
      {
        term: 'Colour',
        definition: 'Product type: PMS petrol, AGO diesel, Jet A-1, IK kerosene.',
        source: 'Batch product code',
      },
    ],
  },
  'flow-ps': {
    title: 'Pump stations',
    items: [
      {
        term: 'Discharge pressure',
        definition: 'Pressure the station is pushing at, in bar.',
        source: 'SCADA pressure transmitters',
      },
      {
        term: 'Status dot',
        definition: 'Green running, amber standby, red fault.',
        source: 'Station control system',
      },
    ],
  },
  'flow-batch': {
    title: 'Active batches table',
    items: [
      {
        term: 'Batch ID',
        definition: 'Unique tag for one slug of a single product in the line.',
        source: 'Batch scheduling module',
      },
      {
        term: 'Product',
        definition: 'PMS, AGO, Jet A-1 or IK.',
        source: 'Batch record',
      },
      {
        term: 'Route',
        definition: 'Origin depot to destination depot.',
        source: 'Batch order',
      },
      {
        term: 'Volume',
        definition: 'Total size of the batch, m³.',
        source: 'Batch order',
      },
      {
        term: 'Injected',
        definition: 'How much has entered the line so far.',
        source: 'Injection-point custody meter',
      },
      {
        term: 'Line position',
        definition: 'Where the batch front currently sits.',
        source: 'Batch tracking model',
      },
      {
        term: 'ETA',
        definition: 'Estimated arrival at destination.',
        source: 'Flow-rate projection',
      },
      {
        term: 'Status',
        definition: 'Scheduled, Pumping, Interface (transmix watch), Delivered.',
        source: 'Batch state machine',
      },
    ],
  },
};
