import { FlowKpiCard } from '@/features/pipeline-flow';
import { useCommercialMetricsContext } from '../commercial-metrics-context';

export function CommercialKpis() {
  const { metrics, isLoading, hasData } = useCommercialMetricsContext();
  const showPlaceholder = isLoading && !hasData;

  return (
    <div className='grid grid-cols-2 items-stretch gap-3 md:grid-cols-3 xl:grid-cols-5'>
      {metrics.kpis.map((kpi, index) => (
        <div key={kpi.id} className='h-full'>
          <FlowKpiCard
            title={kpi.title}
            value={showPlaceholder ? '—' : kpi.value}
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
  );
}
