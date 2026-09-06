import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  HseKpis,
  IncidentRouteMap,
  IncidentsByTypeChart,
  RecentIncidentsTable,
} from '@/features/hse-integrity';

export default function HseIntegrity() {
  return (
    <div className='w-full min-w-0 space-y-4'>
      <AnimatedSection>
        <PageHeader
          title='HSE & Integrity'
          subtitle='Safety performance, spills and pipeline integrity'
          chips={[
            { label: 'Scope', value: 'Line 1+5' },
            { label: 'Audit', value: 'Q3' },
          ]}
        />
      </AnimatedSection>
      <HseKpis />
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <AnimatedSection delay={0.1}>
          <IncidentRouteMap />
        </AnimatedSection>
        <AnimatedSection delay={0.15}>
          <IncidentsByTypeChart />
        </AnimatedSection>
      </div>
      <AnimatedSection delay={0.2}>
        <RecentIncidentsTable />
      </AnimatedSection>
    </div>
  );
}
