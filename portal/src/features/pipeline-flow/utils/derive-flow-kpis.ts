import type { Movement } from '@/types/PetroleumOperations/Movement';
import type { PipelineBatch } from '@/types/PetroleumOperations/PipelineBatch';
import type { FlowKpi } from '../data/dummy';

const KPI_META: Omit<FlowKpi, 'value' | 'delta' | 'deltaType'>[] = [
  {
    id: 'throughput',
    title: 'Throughput today',
    unit: 'm³',
    description: 'Volume moved today across the trunk line',
    color: '#4361ee',
  },
  {
    id: 'flow-rate',
    title: 'Avg flow rate',
    unit: 'm³/h',
    description: 'Average pumping rate over the shift',
    color: '#06b6d4',
  },
  {
    id: 'batches',
    title: 'Active batches',
    description: 'Batches currently in the line',
    color: '#f59e0b',
  },
  {
    id: 'line-pack',
    title: 'Line pack',
    unit: 'm³',
    description: 'Product volume physically inside the pipe',
    color: '#8b5cf6',
  },
  {
    id: 'plan',
    title: 'Plan attainment',
    unit: '%',
    description: 'Actual throughput ÷ planned throughput',
    color: '#10b981',
  },
];

function isSameLocalDay(iso: string | undefined | null, day: Date): boolean {
  if (!iso) return false;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  return (
    date.getFullYear() === day.getFullYear() &&
    date.getMonth() === day.getMonth() &&
    date.getDate() === day.getDate()
  );
}

function formatInt(n: number): string {
  return Math.round(n).toLocaleString();
}

function batchVolume(batch: PipelineBatch | undefined): number {
  const v = Number(batch?.planned_volume_kl);
  return Number.isFinite(v) ? v : 0;
}

function uniqueBatchVolumes(movements: Movement[], batchMap: Map<string, PipelineBatch>): number {
  const seen = new Set<string>();
  let total = 0;
  for (const m of movements) {
    const key = m.pipeline_batch;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    total += batchVolume(batchMap.get(key));
  }
  return total;
}

export function deriveFlowKpis(
  movements: Movement[],
  batches: PipelineBatch[],
  now: Date = new Date()
): FlowKpi[] {
  const batchMap = new Map(batches.map((b) => [b.name, b]));

  const inTransit = movements.filter((m) => m.movement_status === 'In Transit');
  const haltedCount = movements.filter((m) => m.movement_status === 'Halted').length;

  const throughputMovements = movements.filter((m) => {
    if (m.movement_status === 'Completed' && isSameLocalDay(m.end_datetime, now)) return true;
    if (m.movement_status === 'In Transit' && isSameLocalDay(m.start_datetime, now)) return true;
    return false;
  });
  const throughput = uniqueBatchVolumes(throughputMovements, batchMap);

  const rateSource =
    inTransit.filter((m) => m.monitored_flow_rate_m3h != null).length > 0 ? inTransit : movements;
  const rates = rateSource
    .map((m) => Number(m.monitored_flow_rate_m3h))
    .filter((n) => Number.isFinite(n) && n > 0);
  const avgFlow = rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;

  const activeBatchIds = new Set(
    inTransit.map((m) => m.pipeline_batch).filter((id): id is string => Boolean(id))
  );
  const activeBatches = activeBatchIds.size;

  const linePack = uniqueBatchVolumes(inTransit, batchMap);

  const hasAnomalyWatch = inTransit.some(
    (m) => m.anomaly_severity === 'High' || m.anomaly_severity === 'Critical'
  );

  const completedToday = movements.filter(
    (m) => m.movement_status === 'Completed' && isSameLocalDay(m.end_datetime, now)
  );
  const completedVolume = uniqueBatchVolumes(completedToday, batchMap);

  const plannedTodayBatchIds = new Set<string>();
  for (const b of batches) {
    if (isSameLocalDay(b.scheduled_start, now)) plannedTodayBatchIds.add(b.name);
  }
  for (const m of movements) {
    if (
      m.pipeline_batch &&
      (isSameLocalDay(m.start_datetime, now) || isSameLocalDay(m.end_datetime, now))
    ) {
      plannedTodayBatchIds.add(m.pipeline_batch);
    }
  }
  let plannedTodayVolume = 0;
  for (const id of plannedTodayBatchIds) {
    plannedTodayVolume += batchVolume(batchMap.get(id));
  }

  const attainment = plannedTodayVolume > 0 ? (completedVolume / plannedTodayVolume) * 100 : null;

  const planInsight = (() => {
    if (attainment == null) {
      return {
        planDelta: 'no plan data' as const,
        planDeltaType: 'flat' as const,
        throughputDelta: 'no plan data' as const,
        throughputDeltaType: 'flat' as const,
      };
    }
    if (attainment >= 100) {
      return {
        planDelta: 'ahead' as const,
        planDeltaType: 'up' as const,
        throughputDelta: '▲ ahead of plan' as const,
        throughputDeltaType: 'up' as const,
      };
    }
    if (attainment >= 95) {
      return {
        planDelta: 'on plan' as const,
        planDeltaType: 'flat' as const,
        throughputDelta: 'on plan' as const,
        throughputDeltaType: 'flat' as const,
      };
    }
    return {
      planDelta: 'behind' as const,
      planDeltaType: 'down' as const,
      throughputDelta: '▼ behind plan' as const,
      throughputDeltaType: 'down' as const,
    };
  })();

  const values: Record<string, { value: string; delta: string; deltaType: FlowKpi['deltaType'] }> =
    {
      throughput: {
        value: formatInt(throughput),
        delta: planInsight.throughputDelta,
        deltaType: planInsight.throughputDeltaType,
      },
      'flow-rate': {
        value: rates.length ? formatInt(avgFlow) : '—',
        delta: rates.length ? 'steady' : 'no telemetry',
        deltaType: 'flat',
      },
      batches: {
        value: String(activeBatches),
        delta: haltedCount > 0 ? `${haltedCount} halted` : 'in transit',
        deltaType: 'flat',
      },
      'line-pack': {
        value: formatInt(linePack),
        delta: hasAnomalyWatch ? 'watch' : 'nominal',
        deltaType: hasAnomalyWatch ? 'down' : 'flat',
      },
      plan: {
        value: attainment == null ? '—' : formatInt(attainment),
        delta: planInsight.planDelta,
        deltaType: planInsight.planDeltaType,
      },
    };

  return KPI_META.map((meta) => {
    const dynamic = values[meta.id] ?? { value: '—', delta: '—', deltaType: 'flat' as const };
    return {
      ...meta,
      value: dynamic.value,
      delta: dynamic.delta,
      deltaType: dynamic.deltaType,
    };
  });
}
