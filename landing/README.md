# Rein landing page

Static site for Rein, built with Astro 7 and Tailwind 4. Every page is pre-rendered to plain HTML for SEO.

## Commands

```sh
pnpm install
pnpm run dev       # local dev server
pnpm run build     # writes dist/: one index.html per route, sitemap.xml, robots.txt
pnpm run preview   # serves dist/ locally
```

## Where the constants live

`site.config.mjs` holds the site-wide values:

- `SITE_URL`: the base URL for canonical links, Open Graph, sitemap and robots.txt. The domain is not decided, so it is a placeholder (`https://rein.dev`). Change it there only.
- `EARLY_ACCESS_HREF`: the "Request early access" mailto link.

## Routes

- `/`: home
- `/use-cases/pull-request-gates/`
- `/use-cases/incident-triage/`
- `/use-cases/customer-support/`
- `/use-cases/delegating-to-subagents/`
- `/use-cases/human-in-the-loop/`

The use-case pages come from `src/data/useCases.ts`. The flow diagrams come from `src/data/flows.ts`.

`/docs/` is not part of this site. The docs site mounts there later.

## Alpha rule

The site shows no code, syntax, keywords as code, file contents or CLI output. Explain concepts with copy and abstract visuals only. Do not add code samples to the pages.

## Assets

- `public/images/concept-*.webp`: stills from `videos/concept/out/stills`, resized to 1280 px wide. Beat 5 is not used because its labels are keywords.
- `public/og.png`: 1200x630 Open Graph card. Source is `design/og-card.html`. Re-render it with a 1200x630 screenshot if the copy changes.
- The concept video is not hosted yet. The home page has a `<video>` slot with the beat-9 still as its poster. A TODO comment in `src/pages/index.astro` names what to do when the mp4 has a host. Do not commit the mp4.
