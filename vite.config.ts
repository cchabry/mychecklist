
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "5b2f6b0e-03a8-4522-b426-0776d66c2b2a.lovableproject.com"
    ]
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Utiliser nos nouveaux fichiers tsconfig
  root: ".",
  configFile: "./vite.config.ts",
  optimizeDeps: {
    include: []
  }
});
