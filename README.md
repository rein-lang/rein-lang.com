# rein-lang.com

This repo is the source of https://rein-lang.com, the site for the Rein language.

## Layout

- `landing/`: the Astro home page. It serves `/`.
- `docs/`: the VitePress docs. It serves `/docs/`.
- `language/`: the language reference and the agent interface. The docs site includes them.
- `internal/`: public docs for people who work on Rein: proposals, plans, open questions and design reasons. The site does not publish them.

All docs live in this repo. Edit them here: `docs/` for the pages, `language/` for the reference, `internal/` for the internal docs.

## Setup

Run these in `landing/` and `docs/`:

```sh
pnpm install
```

In `landing/`, run `pnpm run dev`. In `docs/`, run `pnpm run docs:dev`.

## Deploy

Every push to `main` deploys the site. GitHub Actions runs `.github/workflows/site.yml`. It publishes to Cloudflare Pages at https://rein-lang.com.

The deploy job needs two repository secrets: `CLOUDFLARE_API_TOKEN` (Cloudflare Pages: Edit) and `CLOUDFLARE_ACCOUNT_ID`.

### Planned move to the rein-lang Cloudflare account

The Pages project and the domain are in a temporary Cloudflare account. Cloudflare blocks moving a newly registered domain for its first 10 days. After 2026-11-17, move them to the Cloudflare account of the rein-lang project:

1. Move the rein-lang.com registration to the new account, and approve the move there.
2. Create the Pages project `rein-lang` in the new account.
3. Create an account API token with Cloudflare Pages: Edit in the new account.
4. Replace the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets, then run `site.yml` from the Actions tab.
5. Add the custom domains `rein-lang.com` and `www.rein-lang.com` to the new project.
6. Check that both hosts return 200 over HTTPS, then delete the old project.

## License

MIT. See `LICENSE`.
