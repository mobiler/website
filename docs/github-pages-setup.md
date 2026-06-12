# Putting mobiler.rs live on GitHub Pages

The site auto-builds and deploys on every push to `main` (see `.github/workflows/deploy.yml`). The only
manual, one-time steps are **enabling Pages** and **pointing the `mobiler.rs` domain at it**.

## 1. Enable GitHub Pages (one-time — already done)

Repo **Settings → Pages → Build and deployment → Source: `GitHub Actions`**.

> Already enabled for this repo. If you ever recreate it: set the source to *GitHub Actions* (not
> "Deploy from a branch"), then re-run the **Deploy to GitHub Pages** workflow.

## 2. Point the `mobiler.rs` domain at GitHub Pages

The repo already contains `public/CNAME` (= `mobiler.rs`), so each deploy tells GitHub the custom domain.
You just need DNS to point at GitHub's servers.

At your **domain registrar / DNS provider** for `mobiler.rs`, add these records:

### Apex domain (`mobiler.rs`) — four `A` records
| Type | Name | Value |
|------|------|-------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

### (Optional) IPv6 — four `AAAA` records
| Type | Name | Value |
|------|------|-------|
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |

### (Optional) `www` redirect — one `CNAME`
| Type | Name | Value |
|------|------|-------|
| CNAME | `www` | `mobiler.github.io.` |

> Use **either** the apex (`A`/`AAAA`) records **or** a `CNAME` on a subdomain — not a `CNAME` on the
> apex (most DNS providers don't allow that). The records above set up the apex `mobiler.rs`.

## 3. Confirm the custom domain in the repo

**Settings → Pages → Custom domain** should already show `mobiler.rs` (from the `CNAME` file). If it's
empty, type `mobiler.rs` and **Save**. GitHub runs a DNS check; once it passes, tick **Enforce HTTPS**
(the TLS certificate is issued automatically — it can take a few minutes to an hour).

## 4. Verify

- DNS propagation: `dig +short mobiler.rs` should return the four GitHub `A` IPs (can take 5 min – 24 h).
- Then `https://mobiler.rs` serves the site, and `https://mobiler.github.io/website/` redirects to it.

## Day-to-day

- **Content/code changes** → push to `main`; the workflow rebuilds and redeploys automatically.
- The **guide** and **capabilities reference** are pulled from the framework repo (`mobiler/mobiler`)
  at build time, so updating the tutorial there and re-running the deploy refreshes the site — no copy
  needed here. (Trigger a refresh anytime via **Actions → Deploy to GitHub Pages → Run workflow**.)

## Troubleshooting

- **Deploy job fails on "Node.js … not supported by Astro"** — the workflow must use Node ≥ 22.12
  (`setup-node` with `node-version: 22`).
- **404 / unstyled page at the `github.io` URL** — expected before DNS is set: the site is built for the
  `mobiler.rs` apex, so asset paths only resolve on the custom domain. It renders correctly once DNS
  points at GitHub Pages.
- **"Domain does not resolve to the GitHub Pages server"** in Settings → Pages — DNS hasn't propagated
  yet; wait and re-check.
