import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { SITE_URL } from "./site.config.mjs";

// The sitemap integration writes sitemap-index.xml. Copy it to sitemap.xml,
// the name the site advertises in robots.txt.
const sitemapXml = {
  name: "rein-sitemap-xml",
  hooks: {
    "astro:build:done": async ({ dir }) => {
      const out = fileURLToPath(dir);
      await copyFile(join(out, "sitemap-index.xml"), join(out, "sitemap.xml"));
    },
  },
};

export default defineConfig({
  site: SITE_URL,
  output: "static",
  trailingSlash: "always",
  integrations: [sitemap(), sitemapXml],
  vite: {
    plugins: [tailwindcss()],
  },
});
