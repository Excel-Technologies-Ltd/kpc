import { FrappeProvider } from "frappe-react-sdk";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

const { VITE_FRAPPE_TOKEN } = import.meta.env;

const getBasename = () => {
  if (
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/dashboard")
  ) {
    return "/dashboard";
  }
  return "/";
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FrappeProvider
    url="http://localhost:8001/"
      socketPort={import.meta.env.DEV ? "9000" : undefined}
      enableSocket={false}
      tokenParams={
        VITE_FRAPPE_TOKEN
          ? {
              useToken: true,
              type: "token",
              token: () => VITE_FRAPPE_TOKEN,
            }
          : undefined
      }
    >
      <BrowserRouter basename={getBasename()}>
        <App />
      </BrowserRouter>
    </FrappeProvider>
  </StrictMode>,
);
