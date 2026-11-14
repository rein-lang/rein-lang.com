# rein-lang.com

This repo is the source of https://rein-lang.com, the site for the Rein language.

## Layout

- `landing/`: the Astro home page. It serves `/`.
- `docs/`: the VitePress docs. It serves `/docs/`.
- `language/`: the language reference, decisions and agent interface. This is the only home of these docs; edit them here. The site includes them.
- `rein/`: a git submodule with the Rein sources. The README, the examples and the CLI pages come from it.

## Setup

Clone with submodules:

```sh
git clone --recurse-submodules https://github.com/rein-lang/rein-lang.com.git
```

Then run the dev server for each site. Run these in `landing/` and `docs/`:

```sh
pnpm install
```

In `landing/`, run `pnpm run dev`. In `docs/`, run `pnpm run docs:dev`.

## Generated pages

The CLI and example pages come from the `rein/` submodule. To regenerate them, run these from the repo root:

```sh
sh docs/scripts/generate-cli.sh
node docs/scripts/generate-examples.mjs
```

Both scripts need `cargo`.

## Update docs to a newer Rein

1. Run `git -C rein pull origin main`.
2. Regenerate the pages.
3. Review the diff and commit it.

## Deploy

Every push to `main` deploys the site. GitHub Actions runs `.github/workflows/site.yml`. It publishes to Cloudflare Pages at https://rein-lang.com.

The deploy job needs two repository secrets: `CLOUDFLARE_API_TOKEN` (Cloudflare Pages: Edit) and `CLOUDFLARE_ACCOUNT_ID`. The build job reads the private `rein` submodule with the `REIN_DEPLOY_KEY` deploy key.

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
