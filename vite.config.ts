import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "demo",
  plugins: [react()],
  server: {
    port: 3008,
    open: true,
  },
  build: {
    outDir: "../dist-demo",
    emptyOutDir: true,
  },
});
