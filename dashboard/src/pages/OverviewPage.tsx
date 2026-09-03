import React from "react";
import { HeroKpi } from "../components/Overview/HeroKpi";
import { ThreadTracker } from "../components/GoldenThread/ThreadTracker";
import { TankFarm3DSection } from "../components/TankFarm/TankFarm3DSection";
import { TankFarmSection } from "../components/TankFarm/TankFarmSection";
import { AISection } from "../components/AIReconciliation/AISection";
import { CommercialSection } from "../components/Commercial/CommercialSection";
import { HSEQSection } from "../components/HSEQ/HSEQSection";
import { DecisionLedger } from "../components/Ledger/DecisionLedger";

export const OverviewPage: React.FC = () => {
  return (
    <div className="space-y-12">
      <HeroKpi />
      <ThreadTracker />
      <TankFarm3DSection />
      <TankFarmSection />
      <AISection />
      <CommercialSection />
      <HSEQSection />
      <DecisionLedger />
    </div>
  );
};

export default OverviewPage;
