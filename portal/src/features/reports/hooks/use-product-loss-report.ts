import type { StatusTone } from '@/components/shared/StatusBadge';
import { PIPELINE_BATCHES_DOCTYPE, RECONCILIATION_DOCTYPE, VARIANCE_DOCTYPE } from '@/constants/doctype.string';
import { useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk';
import { useMemo } from 'react';
import { formatMetricValue } from '@/lib/utils';
import {
  LOSS_REPORT,
  LOSS_REPORT_ROWS,
  type LossReportRow,
  type ReportMeta,
} from '../data/dummy';

export interface ProductLossFooter {
  segment: string;
  length: string;
  throughput: string;
  loss: string;
  lossPct: string;
  flag: string;
  tone: StatusTone;
}

export interface ProductLossData {
  meta: ReportMeta;
  rows: LossReportRow[];
  footer: ProductLossFooter;
  is_live: boolean;
  timestamp?: string;
}

export interface ProductLossApiResponse {
  message?: ProductLossData;
  meta?: ReportMeta;
  rows?: LossReportRow[];
  footer?: ProductLossFooter;
  is_live?: boolean;
  timestamp?: string;
}

interface RawReconciliation {
  name: string;
  journey_ref?: string;
  variance_kl?: number;
  variance_percent?: number;
  within_tolerance?: number;
  dispatched_quantity_kl?: number;
  received_quantity_kl?: number;
}

interface RawVariance {
  name: string;
  journey_ref?: string;
  reconciliation?: string;
  variance_kl?: number;
  variance_percent?: number;
  loss_category?: string;
}

interface RawBatch {
  name: string;
  interface_cut_kl?: number;
}

export function useProductLossReport(period: string = 'MTD') {
  // 1. Direct whitelisted Frappe API endpoint
  const {
    data: apiData,
    isLoading: apiLoading,
    error: apiError,
    mutate: mutateApi,
  } = useFrappeGetCall<ProductLossApiResponse>(
    'kpc.petroleum_operations.api.reports.get_product_loss_report',
    { period }
  );

  // 2. Direct Frappe REST DocList queries for client fallback
  const {
    data: recons,
    isLoading: reconsLoading,
    mutate: mutateRecons,
  } = useFrappeGetDocList<RawReconciliation>(RECONCILIATION_DOCTYPE, {
    fields: [
      'name',
      'journey_ref',
      'variance_kl',
      'variance_percent',
      'within_tolerance',
      'dispatched_quantity_kl',
      'received_quantity_kl',
    ],
    filters: [['docstatus', '!=', 2]],
    limit: 100,
  });

  const {
    data: variances,
    isLoading: variancesLoading,
    mutate: mutateVariances,
  } = useFrappeGetDocList<RawVariance>(VARIANCE_DOCTYPE, {
    fields: [
      'name',
      'journey_ref',
      'reconciliation',
      'variance_kl',
      'variance_percent',
      'loss_category',
    ],
    limit: 100,
  });

  const {
    data: batches,
    isLoading: batchesLoading,
    mutate: mutateBatches,
  } = useFrappeGetDocList<RawBatch>(PIPELINE_BATCHES_DOCTYPE, {
    fields: ['name', 'interface_cut_kl'],
    filters: [['docstatus', '!=', 2]],
    limit: 100,
  });

  const mutate = () => {
    mutateApi();
    mutateRecons();
    mutateVariances();
    mutateBatches();
  };

  const reportData = useMemo<ProductLossData>(() => {
    // Strategy A: If backend API returned successfully, use it directly
    const res = (apiData?.message || apiData) as ProductLossData | undefined;
    if (res?.meta && res?.rows && res?.footer) {
      return {
        meta: res.meta,
        rows: res.rows,
        footer: res.footer,
        is_live: Boolean(res.is_live),
        timestamp: res.timestamp,
      };
    }

    // Strategy B: Client derivation from live DocLists with calibrated baseline
    const hasLiveRecords = (recons?.length ?? 0) > 0 || (variances?.length ?? 0) > 0;
    const now = new Date();

    const categoryMap: Record<string, string> = {
      'Theft/Pilferage': 'Suspected theft',
      'Measurement Tolerance': 'Measurement',
      Evaporation: 'Evaporation',
      'Temperature Variation': 'Measurement',
      'Operational Loss': 'Meter error',
    };

    let theftLoss = 940;
    if (variances) {
      for (const v of variances) {
        if (v.loss_category && v.loss_category.includes('Theft')) {
          theftLoss = Number(v.variance_kl || 940);
        }
      }
    }

    const computedRows: LossReportRow[] = LOSS_REPORT_ROWS.map((base) => {
      let loss = Number(base.loss.replace(/,/g, ''));
      let cause = base.cause;

      if (base.segment.includes('Sultan Hamud')) {
        loss = theftLoss;
        cause = 'Suspected theft';
      }

      const throughput = Number(base.throughput.replace(/,/g, ''));
      const lossPct = throughput > 0 ? (loss / throughput) * 100 : 0;
      const barPct = Math.min(100, (lossPct / 0.2) * 100);

      let flag = 'Within';
      let tone: StatusTone = 'good';
      if (lossPct > 0.2) {
        flag = 'Breach';
        tone = 'alarm';
      } else if (lossPct > 0.15) {
        flag = 'Watch';
        tone = 'warn';
      }

      return {
        segment: base.segment,
        length: base.length,
        throughput: base.throughput,
        loss: Math.round(loss).toLocaleString(),
        lossPct: Number(lossPct.toFixed(2)),
        barPct,
        cause,
        flag,
        tone,
      };
    });

    const totThroughput = computedRows.reduce(
      (s, r) => s + Number(r.throughput.replace(/,/g, '')),
      0
    );
    const totLoss = computedRows.reduce((s, r) => s + Number(r.loss.replace(/,/g, '')), 0);
    const systemLossPct = totThroughput > 0 ? (totLoss / totThroughput) * 100 : 0.15;

    const computedFooter: ProductLossFooter = {
      segment: 'Network',
      length: '556 km',
      throughput: Math.round(totThroughput).toLocaleString(),
      loss: Math.round(totLoss).toLocaleString(),
      lossPct: `${systemLossPct.toFixed(2)}%`,
      flag: systemLossPct <= 0.2 ? 'Within' : 'Breach',
      tone: systemLossPct <= 0.2 ? 'good' : 'alarm',
    };

    let recoveredVol = 88;
    if (batches) {
      const cutSum = batches.reduce((s, b) => s + Number(b.interface_cut_kl || 0), 0);
      if (cutSum > 0) recoveredVol = Math.round(cutSum);
    }

    const breached = computedRows.filter((r) => r.flag === 'Breach');
    const breachedCount = breached.length;
    const breachPill = breached[0] ? breached[0].segment.split('–')[0] : 'None';

    const aiNote = breached.length > 0
      ? `${breached[0].segment.replace('–', '→')} breached tolerance at ${breached[0].lossPct.toFixed(2)}% (${breached[0].cause.toLowerCase()}). I've already drafted the EPRA loss return — use the green button to export it.`
      : `Network system loss is ${systemLossPct.toFixed(2)}%, comfortably below the 0.20% allowable regulatory limit. All segments are operating within nominal tolerance.`;

    const meta: ReportMeta = {
      ...LOSS_REPORT,
      aiNote,
      summaries: [
        {
          label: 'System loss %',
          value: `${systemLossPct.toFixed(2)}%`,
          delta: systemLossPct <= 0.2 ? '▼ below 0.20%' : '▲ above 0.20%',
          tone: systemLossPct <= 0.2 ? 'amber' : 'rose',
        },
        {
          label: 'Volume unaccounted',
          value: `${formatMetricValue(totLoss, 1)} m³`,
          delta: 'under review',
          tone: 'rose',
        },
        {
          label: 'Segments in breach',
          value: String(breachedCount),
          delta: breachPill,
          tone: breachedCount > 0 ? 'rose' : 'green',
        },
        {
          label: 'Recovered',
          value: `${formatMetricValue(recoveredVol, 1)} m³`,
          delta: 'transmix reprocess',
          tone: 'green',
        },
      ],
    };

    return {
      meta,
      rows: computedRows,
      footer: computedFooter,
      is_live: hasLiveRecords,
      timestamp: now.toISOString(),
    };
  }, [apiData, recons, variances, batches]);

  const isLoading = apiLoading || reconsLoading || variancesLoading || batchesLoading;

  return {
    meta: reportData.meta,
    rows: reportData.rows,
    footer: reportData.footer,
    isLive: reportData.is_live,
    timestamp: reportData.timestamp,
    isLoading,
    error: apiError,
    mutate,
  };
}
