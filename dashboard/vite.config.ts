// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import proxyOptions from "./proxyOptions.ts";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 8080,
    host: "0.0.0.0",
    proxy: proxyOptions,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  build: {
    outDir: "../kpc/public/dashboard",
    emptyOutDir: true,
    target: "es2015",
  },
});