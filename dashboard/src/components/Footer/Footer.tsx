import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#1A2540] py-5.5 px-7 max-w-[1400px] mx-auto flex justify-between text-[#5A6D8C] text-[11px] flex-wrap gap-2.5">
      <span>
        KPC Petroleum Operations · built on Frappe, integrated with ArcApps
        Accounts &amp; Stock
      </span>
      <span>
        RBAC/SoD enforced — no single user submits and approves their own
        document
      </span>
    </footer>
  );
};
