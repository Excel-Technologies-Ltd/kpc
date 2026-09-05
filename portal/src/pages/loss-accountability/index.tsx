import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  LossByCauseChart,
  LossHeatmap,
  LossKpis,
  SegmentAccountabilityTable,
} from '@/features/loss-accountability';

export default function LossAccountability() {
  return (
    <div className='mx-auto max-w-7xl space-y-4'>
      <AnimatedSection>
        <PageHeader
          title='Loss & Accountability'
          subtitle='Unaccounted-for volume by segment against tolerance'
          chips={[
            { label: 'Period', value: 'MTD' },
            { label: 'Tolerance', value: '0.20%' },
          ]}
        />
      </AnimatedSection>
      <LossKpis />
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <AnimatedSection delay={0.1}>
          <LossHeatmap />
        </AnimatedSection>
        <AnimatedSection delay={0.15}>
          <LossByCauseChart />
        </AnimatedSection>
      </div>
      <AnimatedSection delay={0.2}>
        <SegmentAccountabilityTable />
      </AnimatedSection>
    </div>
  );
}
