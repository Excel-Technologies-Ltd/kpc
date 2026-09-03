import { useFrappeAuth } from "frappe-react-sdk";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { DashboardLayout } from "./components/Layout/DashboardLayout";
import { AIPage } from "./pages/AIPage";
import { CommercialPage } from "./pages/CommercialPage";
import { HSEQPage } from "./pages/HSEQPage";
import { LedgerPage } from "./pages/LedgerPage";
import { OverviewPage } from "./pages/OverviewPage";
import { TankFarmPage } from "./pages/TankFarmPage";
import { ThreadPage } from "./pages/ThreadPage";
import { CosmicDashboard } from "./pages/new-dashboard/dashboard";



function RootLayout() {
  const { currentUser } = useFrappeAuth();
  return <DashboardLayout currentUser={currentUser} />;
}

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          index: true,
          element: <OverviewPage />,
        },
        {
          path: "thread",
          element: <ThreadPage />,
        },
        {
          path: "tanks",
          element: <TankFarmPage />,
        },
        {
          path: "ai",
          element: <AIPage />,
        },
        {
          path: "commercial",
          element: <CommercialPage />,
        },
        {
          path: "hseq",
          element: <HSEQPage />,
        },
        {
          path: "ledger",
          element: <LedgerPage />,
        },
        {
          path: "cosmic",
          element: <CosmicDashboard />,
        },
        {
          path: "*",
          element: <Navigate to="/" replace />,
        },
      ],
    },
  ],
  {
    basename: "/",
  },
);

export function App() {
  return <RouterProvider router={router} />;
}

export default App;
