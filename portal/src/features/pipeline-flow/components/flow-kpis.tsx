import { MOVEMENT_DOCTYPE, PIPELINE_BATCHES_DOCTYPE } from '@/constants/doctype.string';
import type { Movement } from '@/types/PetroleumOperations/Movement';
import type { PipelineBatch } from '@/types/PetroleumOperations/PipelineBatch';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { useMemo } from 'react';
import { useRegisterPipelineRefresh } from '../pipeline-flow-refresh';
import { deriveFlowKpis } from '../utils/derive-flow-kpis';
import { FlowInfoButton } from './flow-info-button';
import { FlowKpiCard } from './flow-kpi-card';

const MOVEMENT_FIELDS = [
  'name',
  'pipeline_batch',
  'movement_status',
  'start_datetime',
  'end_datetime',
  'monitored_flow_rate_m3h',
  'anomaly_severity',
  'alert_triggered',
] as const satisfies ReadonlyArray<keyof Movement>;

const BATCH_FIELDS = [
  'name',
  'planned_volume_kl',
  'scheduled_start',
  'scheduled_end',
] as const satisfies ReadonlyArray<keyof PipelineBatch>;

export function FlowKpis() {
  const {
    data: movements,
    isLoading: movementsLoading,
    mutate: mutateMovements,
  } = useFrappeGetDocList<Movement>(MOVEMENT_DOCTYPE, {
    fields: [...MOVEMENT_FIELDS],
    limit: 500,
    orderBy: { field: 'modified', order: 'desc' },
  });

  const {
    data: batches,
    isLoading: batchesLoading,
    mutate: mutateBatches,
  } = useFrappeGetDocList<PipelineBatch>(PIPELINE_BATCHES_DOCTYPE, {
    fields: [...BATCH_FIELDS],
    limit: 500,
    orderBy: { field: 'modified', order: 'desc' },
  });

  useRegisterPipelineRefresh(mutateMovements, mutateBatches);

  const kpis = useMemo(
    () => deriveFlowKpis(movements ?? [], batches ?? []),
    [movements, batches]
  );

  const isLoading = movementsLoading || batchesLoading;

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-end'>
        <FlowInfoButton guideKey='flow-kpi' />
      </div>
      <div className='grid grid-cols-2 items-stretch gap-3 md:grid-cols-3 xl:grid-cols-5'>
        {kpis.map((kpi, index) => (
          <div key={kpi.id} className='h-full'>
            <FlowKpiCard
              title={kpi.title}
              value={isLoading && !movements && !batches ? '—' : kpi.value}
              unit={kpi.unit}
              delta={kpi.delta}
              deltaType={kpi.deltaType}
              description={kpi.description}
              color={kpi.color}
              delay={index * 0.08}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
