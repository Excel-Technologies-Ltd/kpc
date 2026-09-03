import React, { type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Footer } from "../Footer/Footer";
import { Rail } from "../Navigation/Rail";
import { Topbar } from "../Navigation/Topbar";

interface DashboardLayoutProps {
  children?: ReactNode;
  currentUser?: string | null;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentUser,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-[#080d16] via-[#101a2b] to-[#172b3d] text-[#eaf1fa]">
      {/* Left Icon Rail Navigation */}
      <Rail />

      {/* Sticky Topbar */}
      <Topbar currentUser={currentUser} />

      {/* Main Container Viewport */}
      <div className="flex-1 flex flex-col w-full">
        <main className="max-w-350 w-full mx-auto px-4 sm:px-7 py-8 flex-1 relative z-10 transition-all duration-300">
          {children || <Outlet />}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
