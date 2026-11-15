// Reads the VitePress docs sources at build time, for llms.txt and llms-full.txt.
// The build runs in landing/, so the docs live in ../docs.
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const DOCS_DIR = resolve(process.cwd(), "../docs");
const SECTIONS = ["", "examples", "reference"];

export interface DocsPage {
  title: string;
  description?: string;
  path: string;
  markdown: string;
}

// VitePress replaces `<!--@include: file-->` with the file. Do the same, nested, relative to each file.
function withIncludes(file: string): string {
  const text = readFileSync(file, "utf8");
  return text.replace(/<!--\s*@include:\s*(.+?)\s*-->/g, (_, target: string) =>
    withIncludes(join(dirname(file), target)),
  );
}

// ponytail: line-based frontmatter read, enough for the flat `key: value` pairs the docs use.
function splitFrontmatter(text: string): { meta: Record<string, string>; body: string } {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return { meta: {}, body: text };
  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const pair = line.match(/^(\w+):\s*(.*)$/);
    if (pair) meta[pair[1]] = pair[2].replace(/^["'](.*)["']$/, "$1");
  }
  return { meta, body: text.slice(match[0].length) };
}

function urlPath(section: string, file: string): string {
  const prefix = section ? `/docs/${section}/` : "/docs/";
  return file === "index.md" ? prefix : prefix + file.replace(/\.md$/, "");
}

export function docsPages(): DocsPage[] {
  return SECTIONS.flatMap((section) => {
    const dir = join(DOCS_DIR, section);
    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .sort((a, b) => Number(b === "index.md") - Number(a === "index.md") || a.localeCompare(b));
    return files.map((file) => {
      const { meta, body } = splitFrontmatter(withIncludes(join(dir, file)));
      const heading = body.match(/^# (.+)$/m)?.[1].trim();
      return {
        title: meta.title || heading || file,
        description: meta.description,
        path: urlPath(section, file),
        markdown: body.trim(),
      };
    });
  });
}

// The release tag that Getting started installs, so the site states one version.
export function reinVersion(): string | undefined {
  const text = readFileSync(join(DOCS_DIR, "getting-started.md"), "utf8");
  return text.match(/--tag v(\S+)/)?.[1];
}
