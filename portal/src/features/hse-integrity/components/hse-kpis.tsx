import { FlowKpiCard } from '@/components/shared/FlowKpiCard';
import { HSE_KPIS } from '../data/dummy';

export function HseKpis() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 min-w-0 items-stretch gap-3'>
      {HSE_KPIS.map((kpi, index) => (
        <div key={kpi.title} className='h-full min-w-0'>
          <FlowKpiCard {...kpi} delay={index * 0.08} />
        </div>
      ))}
    </div>
  );
}
