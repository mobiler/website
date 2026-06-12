# mobiler.rs — the Mobiler website

The landing page + documentation for [Mobiler](https://github.com/mobiler/mobiler), built with
[Astro](https://astro.build) + [Starlight](https://starlight.astro.build) and deployed to GitHub
Pages at **https://mobiler.rs**.

## Content model

Authored pages live here:

- `src/content/docs/index.mdx` — the landing page
- `src/content/docs/quickstart.md` — install + scaffold + run

The **guide** and the **capabilities reference** are *not* stored in this repo — they are the source
of truth in the framework repo and are **synced at build time** by
[`scripts/sync-content.mjs`](scripts/sync-content.mjs):

| Site section | Synced from `mobiler/mobiler` |
|--------------|-------------------------------|
| `guide/` (the Saldo tutorial) | `docs/tutorial/saldo/*.md` |
| `reference/capabilities` | `capabilities.json` |

This keeps the docs from drifting: the tutorial evolves with the code in the framework repo, and the
website always rebuilds from the latest.

## Develop locally

Clone the framework repo next to this one (or point `MOBILER_REPO` at it):

```sh
# layout: ./mobiler and ./website side by side
git clone https://github.com/mobiler/mobiler
npm install
npm run dev          # runs the sync, then starts the dev server at localhost:4321
```

`npm run sync` populates `src/content/docs/guide/` and `reference/capabilities.md` from the framework
repo (those paths are gitignored).

## Deploy

`.github/workflows/deploy.yml` checks out this repo **and** `mobiler/mobiler`, runs `npm run build`
(sync + Astro), and publishes `dist/` to GitHub Pages on every push to `main`. The custom domain is
set via `public/CNAME`.
