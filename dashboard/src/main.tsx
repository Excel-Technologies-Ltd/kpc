import { FrappeProvider } from "frappe-react-sdk";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const { VITE_FRAPPE_TOKEN } = import.meta.env;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FrappeProvider
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
      <App />
    </FrappeProvider>
  </StrictMode>,
);
