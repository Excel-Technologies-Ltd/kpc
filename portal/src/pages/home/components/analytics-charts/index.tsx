import { ThroughputTrendChart } from './throughput-trend-chart';
import { RevenueVsTargetChart } from './revenue-vs-target-chart';

export { ThroughputTrendChart } from './throughput-trend-chart';
export { ProductMixChart } from './product-mix-chart';
export { RevenueVsTargetChart } from './revenue-vs-target-chart';

// ============================================================================
// Combined Analytics Charts Component
// ============================================================================
export function AnalyticsCharts() {
  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
      <ThroughputTrendChart />
      <RevenueVsTargetChart />
    </div>
  );
}
