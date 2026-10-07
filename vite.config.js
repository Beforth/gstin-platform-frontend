import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The browser only ever talks to our own /api; provider calls happen in server/.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  server: {
    port: 5173,
    // Everything the browser calls is proxied to the gateway: web UI routes, accounts, the dashboard API and the public API.
    // changeOrigin:false keeps the browser's Host header. The server's CSRF check compares Origin with Host, so a
    // proxy that rewrites Host (Vite's default for string targets) makes every sign-in look cross-site.
    proxy: Object.fromEntries(
      ["/api", "/auth", "/console", "/v1"].map((p) => [p, { target: process.env.GST_API || "http://localhost:3001", changeOrigin: false }]),
    ),
  },
});
