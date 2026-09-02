import React, { type ReactNode } from "react";
import { Footer } from "../Footer/Footer";
import { Rail } from "../Navigation/Rail";
import { Topbar } from "../Navigation/Topbar";

interface DashboardLayoutProps {
  children: ReactNode;
  currentUser?: string | null;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentUser,
  activeSection,
  setActiveSection,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#080d16] text-[#eaf1fa]">
      {/* Left Icon Rail Navigation */}
      <Rail activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Sticky Topbar */}
      <Topbar currentUser={currentUser} />

      {/* Main Container Viewport */}
      <div className="flex-1 flex flex-col w-full">
        <main className="max-w-350 w-full mx-auto px-4 sm:px-7 py-8 flex-1 relative z-10 transition-all duration-300">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
