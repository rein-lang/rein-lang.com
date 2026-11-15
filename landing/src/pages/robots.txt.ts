import type { APIRoute } from "astro";
import { SITE_URL } from "../../site.config.mjs";

export const GET: APIRoute = () => {
  const sitemaps = ["/sitemap.xml", "/docs/sitemap.xml"].map((path) => `Sitemap: ${new URL(path, SITE_URL).href}`);
  const body = `User-agent: *\nAllow: /\n\n${sitemaps.join("\n")}\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
