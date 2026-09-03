import React from "react";
import { AISection } from "../components/AIReconciliation/AISection";
import { CommercialSection } from "../components/Commercial/CommercialSection";
import { ThreadTracker } from "../components/GoldenThread/ThreadTracker";
import { HSEQSection } from "../components/HSEQ/HSEQSection";
import { DecisionLedger } from "../components/Ledger/DecisionLedger";
import { HeroKpi } from "../components/Overview/HeroKpi";
import { StockMovementCard } from "../components/Overview/StockMovementCard";
import { TankFarm3DSection } from "../components/TankFarm/TankFarm3DSection";
import { TankFarmSection } from "../components/TankFarm/TankFarmSection";
import CosmicDashboard from "./new-dashboard/test";

export const OverviewPage: React.FC = () => {
  return (
    <div className="space-y-12">
      <CosmicDashboard />
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
};

export default OverviewPage;
