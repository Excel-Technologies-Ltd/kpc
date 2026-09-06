import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  AssetsKpis,
  CriticalAssetsTable,
  UptimeCostChart,
  WorkOrdersKanban,
} from '@/features/assets-eam';

export default function AssetsEam() {
  return (
    <div className='mx-auto container space-y-4'>
      <AnimatedSection>
        <PageHeader
          title='Assets & EAM'
          subtitle='Equipment health, work orders and preventive maintenance'
          chips={[
            { label: 'Sites', value: '5 stations' },
            { label: 'Sensors', value: 'live' },
          ]}
        />
      </AnimatedSection>
      <AssetsKpis />
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <AnimatedSection delay={0.1}>
          <WorkOrdersKanban />
        </AnimatedSection>
        <AnimatedSection delay={0.15}>
          <UptimeCostChart />
        </AnimatedSection>
      </div>
      <AnimatedSection delay={0.2}>
        <CriticalAssetsTable />
      </AnimatedSection>
    </div>
  );
}
