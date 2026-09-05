import { FlowKpiCard } from '@/components/shared/FlowKpiCard';
import { LOSS_KPIS } from '../data/dummy';

export function LossKpis() {
  return (
    <div className='grid grid-cols-2 items-stretch gap-3 md:grid-cols-3 xl:grid-cols-5'>
      {LOSS_KPIS.map((kpi, index) => (
        <div key={kpi.title} className='h-full'>
          <FlowKpiCard {...kpi} delay={index * 0.08} />
        </div>
      ))}
    </div>
  );
}
