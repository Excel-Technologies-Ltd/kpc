import {
  AISection,
  CommercialSection,
  DecisionLedger,
  HeroKpi,
  HSEQSection,
  StockMovementCard,
  TankFarm3DSection,
  TankFarmSection,
  ThreadTracker,
} from '@/features/overview';

export default function OverviewPage() {
  return (
    <div className='w-full min-w-0 space-y-10'>
      <HeroKpi />
      <StockMovementCard />
      <ThreadTracker />
      <TankFarm3DSection />
      <TankFarmSection />
      <AISection />
      <CommercialSection />
      <HSEQSection />
      <DecisionLedger />
    </div>
  );
}
