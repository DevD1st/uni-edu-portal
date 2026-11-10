import { themeInitScript } from "@uemp/ui/theme-init";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "uemp-theme-init",
      transformIndexHtml() {
        return [{ tag: "script", children: themeInitScript, injectTo: "head-prepend" }];
      },
    },
  ],
  server: { port: 3002, strictPort: true },
  preview: { port: 3002, strictPort: true },
});
