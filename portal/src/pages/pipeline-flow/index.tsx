import {
  ActiveBatchesTable,
  AnimatedSection,
  FlowKpis,
  FlowPageHeader,
  ProductFlowDiagram,
} from '@/features/pipeline-flow';

export default function PipelineFlow() {
  return (
    <div className='mx-auto max-w-7xl space-y-4'>
      <AnimatedSection>
        <FlowPageHeader />
      </AnimatedSection>
      <FlowKpis />
      <ProductFlowDiagram />
      <ActiveBatchesTable />
    </div>
  );
}
