import { useFrappeAuth } from "frappe-react-sdk";
import { useState } from "react";
import { AISection } from "./components/AIReconciliation/AISection";
import { CommercialSection } from "./components/Commercial/CommercialSection";
import { Footer } from "./components/Footer/Footer";
import { ThreadTracker } from "./components/GoldenThread/ThreadTracker";
import { HSEQSection } from "./components/HSEQ/HSEQSection";
import { DecisionLedger } from "./components/Ledger/DecisionLedger";
import { Rail } from "./components/Navigation/Rail";
import { Topbar } from "./components/Navigation/Topbar";
import { HeroKpi } from "./components/Overview/HeroKpi";
import { TankFarmSection } from "./components/TankFarm/TankFarmSection";

export function App() {
  const { currentUser } = useFrappeAuth();
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <>
      {/* Left Icon Rail */}
      <Rail activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Topbar */}
      <Topbar currentUser={currentUser} />

      {/* Main Container */}
      <main>
        <HeroKpi />
        <ThreadTracker />
        <TankFarmSection />
        <AISection />
        <CommercialSection />
        <HSEQSection />
        <DecisionLedger />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}

export default App;
