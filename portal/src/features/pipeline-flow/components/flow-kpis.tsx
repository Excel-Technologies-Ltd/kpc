import { FLOW_KPIS } from '../data/dummy';
import { FlowInfoButton } from './flow-info-button';
import { FlowKpiCard } from './flow-kpi-card';

export function FlowKpis() {
  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-end'>
        <FlowInfoButton guideKey='flow-kpi' />
      </div>
      <div className='grid grid-cols-2 items-stretch gap-3 md:grid-cols-3 xl:grid-cols-5'>
        {FLOW_KPIS.map((kpi, index) => (
          <div key={kpi.id} className='h-full'>
            <FlowKpiCard
              title={kpi.title}
              value={kpi.value}
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
