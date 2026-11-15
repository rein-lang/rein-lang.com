// llms.txt (https://llmstxt.org): a short markdown map of the site for AI tools.
import type { APIRoute } from "astro";
import { SITE_URL, HOME_DESCRIPTION } from "../../site.config.mjs";
import { docsPages } from "../data/docsPages";
import { useCases } from "../data/useCases";

const link = (title: string, path: string, note?: string) =>
  `- [${title}](${new URL(path, SITE_URL).href})${note ? `: ${note}` : ""}`;

export const GET: APIRoute = () => {
  const docs = docsPages().map((page) => link(page.title, page.path, page.description));
  const cases = useCases.map((u) => link(u.h1, `/use-cases/${u.slug}/`, u.teaser));
  const body = [
    "# Rein",
    "",
    `> ${HOME_DESCRIPTION}`,
    "",
    "Rein is a small language for the decisions an agent makes. Each decision is a function in its own file. A function asks the agent one question. Each answer leads to an instruction or a pointer to the next function. The `rein` command checks that each case has a next step. It also runs a process one step at a time. Rein is in alpha.",
    "",
    `The full text of all docs pages is in [llms-full.txt](${new URL("/llms-full.txt", SITE_URL).href}).`,
    "",
    "## Docs",
    "",
    ...docs,
    "",
    "## Use cases",
    "",
    link("All use cases", "/use-cases/", "every use case page, with a short summary of each"),
    ...cases,
    "",
    "## Optional",
    "",
    link("rein-lang/rein", "https://github.com/rein-lang/rein", "source code of the language, the checker and the `rein` command"),
    link("rein-lang/examples", "https://github.com/rein-lang/examples", "example Rein programs"),
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
