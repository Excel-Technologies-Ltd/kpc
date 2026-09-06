import {
  AnimatedSection,
  CommercialKpis,
  CommercialMetricsProvider,
  CommercialPageHeader,
  CommercialRevenueRefreshProvider,
  ProductRevenueMixChart,
  RevenueByProductChart,
  TopCustomersTable,
} from '@/features/commercial-revenue';

export default function CommercialRevenue() {
  return (
    <CommercialRevenueRefreshProvider>
      <CommercialMetricsProvider>
        <div className='w-full min-w-0 space-y-4'>
          <AnimatedSection>
            <CommercialPageHeader />
          </AnimatedSection>
          <CommercialKpis />
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            <AnimatedSection delay={0.1}>
              <RevenueByProductChart />
            </AnimatedSection>
            <AnimatedSection delay={0.15}>
              <ProductRevenueMixChart />
            </AnimatedSection>
          </div>
          <TopCustomersTable />
        </div>
      </CommercialMetricsProvider>
    </CommercialRevenueRefreshProvider>
  );
}
