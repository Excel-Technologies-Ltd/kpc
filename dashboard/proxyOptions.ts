import type { ProxyOptions } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let webserver_port = 8000;
try {
  const configPath = path.resolve(__dirname, "../../../sites/common_site_config.json");
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    if (config.webserver_port) {
      webserver_port = config.webserver_port;
    }
  }
} catch {
  // fallback to 8000
}

let default_site = "development.localhost";
try {
  const sitesPath = path.resolve(__dirname, "../../../sites");
  if (fs.existsSync(path.join(sitesPath, "currentsite.txt"))) {
    default_site = fs.readFileSync(path.join(sitesPath, "currentsite.txt"), "utf-8").trim();
  }
} catch {
  // fallback
}

export default {
  "^/(app|login|api|assets|files|private)": {
    target: `http://127.0.0.1:${webserver_port}`,
    ws: true,
    changeOrigin: true,
    headers: {
      Host: default_site,
      Origin: `http://${default_site}:${webserver_port}`,
    },
    configure: (proxy) => {
      proxy.on("proxyReq", (proxyReq, req) => {
        let site = default_site;
        const host = req.headers.host || "";
        const site_name = host.split(":")[0];
        if (
          site_name &&
          site_name !== "localhost" &&
          site_name !== "127.0.0.1" &&
          !/^(\d{1,3}\.){3}\d{1,3}$/.test(site_name)
        ) {
          site = site_name;
        }
        proxyReq.setHeader("Host", `${site}:${webserver_port}`);
        proxyReq.setHeader("X-Frappe-Site-Name", site);
      });
    },
  },
} as Record<string, ProxyOptions>;