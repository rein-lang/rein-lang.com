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

## License

MIT. See `LICENSE`.
