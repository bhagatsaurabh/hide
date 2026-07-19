import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import svgr from "vite-plugin-svgr";
import SRI from "./plugins/subresource-integrity";
import path from "path";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

export default defineConfig({
  build: {
    assetsInlineLimit: 0,
  },
  plugins: [
    svgr(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png}"],
        globIgnores: ["**/index-*.js", "**/*.worker*.js"],
        navigateFallbackDenylist: [/^\/__\/auth\//],
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
            src: "images/logo192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "images/logo512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
    SRI(),
    {
      name: "html-transform",
      transformIndexHtml(html) {
        return html.replace(
          "</head>",
          ` <meta name="version" content="${pkg.version}">
            <meta name="builddate" content="${new Date().toUTCString()}">
          </head>`,
        );
      },
    },
    {
      name: "mock",
      configureServer(server) {
        server.middlewares.use("/templates.json", (_req, res) => {
          const json = readFileSync(path.resolve(__dirname, "mocks/templates.json"), "utf8");
          res.setHeader("Content-Type", "application/json");
          res.end(json);
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
