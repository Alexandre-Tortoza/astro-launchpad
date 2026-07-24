import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const serverOutput = process.env.ASTRO_OUTPUT === "server";

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? "https://example.com",
  integrations: [sitemap()],
  output: serverOutput ? "server" : "static",
  adapter: serverOutput ? node({ mode: "standalone" }) : undefined,
  vite: {
    plugins: [tailwindcss()],
  },
});
