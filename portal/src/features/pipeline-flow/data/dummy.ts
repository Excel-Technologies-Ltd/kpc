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

export type InfoGuideKey = 'flow-kpi' | 'flow-sankey' | 'flow-batch';

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
        definition:
          'Sum of planned batch volumes for movements completed today or in transit that started today.',
        source: 'Movement + Pipeline Batch.planned_volume_kl',
      },
      {
        term: 'Avg flow rate',
        definition: 'Average monitored flow rate (m³/h) on in-transit movements.',
        source: 'Movement.monitored_flow_rate_m3h',
      },
      {
        term: 'Active batches',
        definition: 'Distinct pipeline batches currently marked In Transit.',
        source: 'Movement.pipeline_batch where movement_status = In Transit',
      },
      {
        term: 'Line pack',
        definition:
          'Proxy for product in the line: sum of planned volumes for in-transit batches.',
        source: 'Movement (In Transit) + Pipeline Batch.planned_volume_kl',
      },
      {
        term: 'Plan attainment',
        definition: 'Completed-today volume ÷ planned-today volume × 100.',
        source: 'Movement + Pipeline Batch schedule/volumes',
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
  'flow-batch': {
    title: 'Pipeline batches',
    items: [
      {
        term: 'Batch',
        definition: 'Pipeline Batch document name for this product slug.',
        source: 'Pipeline Batch',
      },
      {
        term: 'Product',
        definition: 'Linked Item being pumped in this batch.',
        source: 'Pipeline Batch.product',
      },
      {
        term: 'Origin / Destination',
        definition: 'Terminals this batch moves between.',
        source: 'Pipeline Batch.origin_terminal / destination_terminal',
      },
      {
        term: 'Seq',
        definition: 'Pumping sequence number used for adjacency and compatibility checks.',
        source: 'Pipeline Batch.batch_sequence_no',
      },
      {
        term: 'Planned vol (KL)',
        definition: 'Planned batch volume in kilolitres.',
        source: 'Pipeline Batch.planned_volume_kl',
      },
      {
        term: 'Interface cut (KL)',
        definition: 'Transmix / interface cut volume at the batch boundary when required.',
        source: 'Pipeline Batch.interface_cut_kl',
      },
      {
        term: 'Scheduled start / end',
        definition: 'Planned pumping window for the batch.',
        source: 'Pipeline Batch.scheduled_start / scheduled_end',
      },
      {
        term: 'Status',
        definition: 'Document status: Draft, Submitted, or Cancelled.',
        source: 'Pipeline Batch.docstatus',
      },
    ],
  },
};
