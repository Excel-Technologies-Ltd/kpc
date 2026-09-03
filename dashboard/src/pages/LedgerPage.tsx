import React from "react";
import { DecisionLedger } from "../components/Ledger/DecisionLedger";

export const LedgerPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <DecisionLedger />
    </div>
  );
};

export default LedgerPage;
