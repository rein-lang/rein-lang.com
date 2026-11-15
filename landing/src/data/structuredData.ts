// Shared schema.org pieces for the JSON-LD of each landing page.
import { SITE_URL } from "../../site.config.mjs";

export type JsonLd = Record<string, unknown>;

export const absolute = (path: string) => new URL(path, SITE_URL).href;

export const website: JsonLd = { "@type": "WebSite", name: "Rein", url: absolute("/") };

// A BreadcrumbList from Home to the current page. Each crumb is [name, path].
export function breadcrumbs(crumbs: [string, string][]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [["Home", "/"], ...crumbs].map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: absolute(path),
    })),
  };
}
