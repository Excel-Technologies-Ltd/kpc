import { Navigate, Route, Routes } from "react-router-dom";
import { useFrappeAuth } from "frappe-react-sdk";
import { DashboardLayout } from "./components/Layout/DashboardLayout";
import { AIPage } from "./pages/AIPage";
import { CommercialPage } from "./pages/CommercialPage";
import { HSEQPage } from "./pages/HSEQPage";
import { LedgerPage } from "./pages/LedgerPage";
import { OverviewPage } from "./pages/OverviewPage";
import { TankFarmPage } from "./pages/TankFarmPage";
import { ThreadPage } from "./pages/ThreadPage";

export function App() {
  const { currentUser } = useFrappeAuth();

  return (
    <DashboardLayout currentUser={currentUser}>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/thread" element={<ThreadPage />} />
        <Route path="/tanks" element={<TankFarmPage />} />
        <Route path="/ai" element={<AIPage />} />
        <Route path="/commercial" element={<CommercialPage />} />
        <Route path="/hseq" element={<HSEQPage />} />
        <Route path="/ledger" element={<LedgerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

export default App;
