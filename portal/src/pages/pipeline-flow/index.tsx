import {
  ActiveBatchesTable,
  AnimatedSection,
  FlowKpis,
  FlowPageHeader,
  ProductFlowDiagram,
} from '@/features/pipeline-flow';
import { PipelineFlowRefreshProvider } from '@/features/pipeline-flow/pipeline-flow-refresh';

export default function PipelineFlow() {
  return (
    <PipelineFlowRefreshProvider>
      <div className='mx-auto max-w-7xl space-y-4'>
        <AnimatedSection>
          <FlowPageHeader />
        </AnimatedSection>
        <FlowKpis />
        <ProductFlowDiagram />
        <ActiveBatchesTable />
      </div>
    </PipelineFlowRefreshProvider>
  );
}
