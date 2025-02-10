import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import SRI from "./plugins/subresource-integrity";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png}"],
      },
      includeAssets: ["assets/favicon.ico", "assets/images/logo192.png"],
      manifest: {
        name: "HIDE",
        short_name: "HIDE",
        description: "A cloud platform with real-time collaborative tools for quick prototyping & development",
        theme_color: "#000000",
        background_color: "#000000",
        icons: [
          {
            src: "assets/images/logo192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "assets/images/logo512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
    SRI(),
  ],
});
