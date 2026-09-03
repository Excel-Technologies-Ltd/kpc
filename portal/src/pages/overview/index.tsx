import { AISection } from '@/features/ai-reconciliation';
import { CommercialSection } from '@/features/commercial';
import { ThreadTracker } from '@/features/golden-thread';
import { HSEQSection } from '@/features/hseq';
import { DecisionLedger } from '@/features/ledger';
import { HeroKpi, StockMovementCard } from '@/features/overview';
import { TankFarm3DSection, TankFarmSection } from '@/features/tank-farm';

export default function OverviewPage() {
  return (
    <div className='mx-auto max-w-7xl space-y-10'>
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
