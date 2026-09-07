import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PRODUCT_COLORS } from '../data/dummy';
import { AnimatedSection } from './animated-section';
import { FlowInfoButton } from './flow-info-button';
import { ProductFlow3D } from './product-flow-3d';

export function ProductFlowDiagram() {
  return (
    <AnimatedSection delay={0.15}>
      <Card className='border-border bg-card transition-shadow hover:shadow-md'>
        <CardHeader className='pb-2'>
          <div className='flex items-center gap-2'>
            <CardTitle className='text-[14.5px] text-foreground'>Product flow</CardTitle>
            <FlowInfoButton guideKey='flow-sankey' />
            <span className='text-muted-foreground ml-auto text-[11px] font-medium'>
              source → destination
            </span>
          </div>
          <CardDescription>
            Stream width is proportional to volume moving on that leg right now.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductFlow3D />
          <div className='text-muted-foreground mt-2 flex flex-wrap gap-4 text-[11.5px]'>
            {(
              [
                ['pms', 'PMS'],
                ['ago', 'AGO'],
                ['jet', 'Jet A-1'],
                ['ik', 'IK'],
              ] as const
            ).map(([key, label]) => (
              <span key={key} className='inline-flex items-center gap-1.5'>
                <span
                  className='inline-block size-2.5 rounded-sm'
                  style={{ background: PRODUCT_COLORS[key] }}
                />
                {label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </AnimatedSection>
  );
}
