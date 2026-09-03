import { useState } from "react";
import { useFrappeAuth } from "frappe-react-sdk";
import { DashboardLayout } from "./components/Layout/DashboardLayout";
import { HeroKpi } from "./components/Overview/HeroKpi";
import { ThreadTracker } from "./components/GoldenThread/ThreadTracker";
import { TankFarmSection } from "./components/TankFarm/TankFarmSection";
import { TankFarm3DSection } from "./components/TankFarm/TankFarm3DSection";
import { AISection } from "./components/AIReconciliation/AISection";
import { CommercialSection } from "./components/Commercial/CommercialSection";
import { HSEQSection } from "./components/HSEQ/HSEQSection";
import { DecisionLedger } from "./components/Ledger/DecisionLedger";

export function App() {
  const { currentUser } = useFrappeAuth();
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <DashboardLayout
      currentUser={currentUser}
      activeSection={activeSection}
      setActiveSection={setActiveSection}
    >
      <HeroKpi />
      <ThreadTracker />
      <TankFarm3DSection />
      <TankFarmSection />
      <AISection />
      <CommercialSection />
      <HSEQSection />
      <DecisionLedger />
    </DashboardLayout>
  );
}

export default App;
