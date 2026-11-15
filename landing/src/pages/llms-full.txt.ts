// llms-full.txt: the full markdown of each docs page, with the language spec inlined.
import type { APIRoute } from "astro";
import { SITE_URL, HOME_DESCRIPTION } from "../../site.config.mjs";
import { docsPages } from "../data/docsPages";

export const GET: APIRoute = () => {
  const pages = docsPages().map(
    (page) => `# ${page.title}\n\nSource: ${new URL(page.path, SITE_URL).href}\n\n${page.markdown}\n`,
  );
  const body = [`# Rein\n\n> ${HOME_DESCRIPTION}\n`, ...pages].join("\n---\n\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
