import { FlowKpiCard } from '@/components/shared/FlowKpiCard';
import { LOSS_KPIS } from '../data/dummy';

export function LossKpis() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 min-w-0 items-stretch gap-3'>
      {LOSS_KPIS.map((kpi, index) => (
        <div key={kpi.title} className='h-full min-w-0'>
          <FlowKpiCard {...kpi} delay={index * 0.08} />
        </div>
      ))}
    </div>
  );
}
