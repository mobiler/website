// Pull the website's source-of-truth content out of the framework repo (mobiler/mobiler):
//   - docs/tutorial/saldo/*.md  -> src/content/docs/guide/*   (the cornerstone guide)
//   - capabilities.json         -> src/content/docs/reference/capabilities.md
// Run before every build (npm run sync). Locally it reads a sibling ../mobiler checkout; in CI the
// deploy workflow checks the framework repo out and points MOBILER_REPO at it. Keeping content in
// the framework repo (where it evolves with the code) and syncing at build time avoids any drift.
import fs from 'node:fs';
import path from 'node:path';

const REPO = process.env.MOBILER_REPO || path.resolve(process.cwd(), '..', 'mobiler');
const GH = 'https://github.com/mobiler/mobiler/blob/main';

const TUT_DIR = path.join(REPO, 'docs/tutorial/saldo');
const CAPS_FILE = path.join(REPO, 'capabilities.json');
const GUIDE_OUT = path.resolve('src/content/docs/guide');
const REF_OUT = path.resolve('src/content/docs/reference');

if (!fs.existsSync(TUT_DIR)) {
  console.error(`✗ framework repo not found at ${REPO}\n  set MOBILER_REPO or clone mobiler next to this repo.`);
  process.exit(1);
}

fs.rmSync(GUIDE_OUT, { recursive: true, force: true });
fs.mkdirSync(GUIDE_OUT, { recursive: true });
fs.mkdirSync(REF_OUT, { recursive: true });

/** Rewrite repo-relative markdown links for the website. */
function rewriteLinks(md) {
  return md
    // sibling chapter links:  02-persist-with-sqlite.md(#anchor) -> /guide/02-persist-with-sqlite/(#anchor)
    .replace(/\]\((\d{2}-[a-z0-9-]+)\.md(#[^)]*)?\)/g, (_, slug, anchor) => `](/guide/${slug}/${anchor || ''})`)
    // the guide README:  README.md -> /guide/
    .replace(/\]\(README\.md(#[^)]*)?\)/g, (_, anchor) => `](/guide/${anchor || ''})`)
    // repo-relative links (../../../X from docs/tutorial/saldo) -> GitHub blob URLs
    .replace(/\]\((?:\.\.\/)+([^)]+)\)/g, (_, p) => `](${GH}/${p})`);
}

/** First `# H1` becomes the frontmatter title; strip it from the body (Starlight renders the title). */
function splitTitle(md) {
  const m = md.match(/^#\s+(.+?)\s*$/m);
  // frontmatter titles are plain text — drop markdown emphasis / code marks
  const title = (m ? m[1] : 'Untitled').replace(/[*`]/g, '');
  const body = m ? md.replace(m[0], '').replace(/^\s+/, '') : md;
  return { title, body };
}

function yamlEscape(s) {
  return `"${s.replace(/"/g, '\\"')}"`;
}

// ---- the guide: README (index) + numbered chapters ----
let chapters = 0;
for (const file of fs.readdirSync(TUT_DIR).sort()) {
  if (!file.endsWith('.md')) continue;
  const raw = fs.readFileSync(path.join(TUT_DIR, file), 'utf8');
  const { title, body } = splitTitle(rewriteLinks(raw));
  const isReadme = file.toLowerCase() === 'readme.md';
  const order = isReadme ? 0 : Number.parseInt(file.slice(0, 2), 10) || 99;
  const slug = isReadme ? 'index' : file.replace(/\.md$/, '');
  const fm = [
    '---',
    `title: ${yamlEscape(title)}`,
    'sidebar:',
    `  order: ${order}`,
    isReadme ? '  label: Overview' : null,
    '---',
    '',
  ].filter(Boolean).join('\n');
  fs.writeFileSync(path.join(GUIDE_OUT, `${slug}.md`), fm + body + '\n');
  if (!isReadme) chapters += 1;
}

// ---- the reference: capabilities table, generated from capabilities.json ----
const caps = JSON.parse(fs.readFileSync(CAPS_FILE, 'utf8')).capabilities;
const cell = (s) => (s ?? '').toString().replace(/\|/g, '\\|');
const statusBadge = { shipped: '✅', 'in-progress': '🚧', planned: '🔭' };
const rows = caps
  .map((c) => `| **${cell(c.name)}** | \`${cell(c.api)}\` | \`${cell(c.plugin)}\` | ${statusBadge[c.status] || ''} ${cell(c.status)} | ${cell(c.since)} | ${cell(c.notes)} |`)
  .join('\n');
const refMd = `---
title: Capabilities
description: The built-in, cross-platform capabilities a Mobiler app can call.
sidebar:
  order: 1
---

Every capability below is **built in and free**, callable from your Rust core via \`cx\` — native on
iOS and Android, and on the web where supported. This table is generated from the framework's
[\`capabilities.json\`](${GH}/capabilities.json), so it never drifts.

| Capability | API | Plugin | Status | Since | Notes |
|------------|-----|--------|--------|-------|-------|
${rows}

✅ shipped · 🚧 in progress · 🔭 planned
`;
fs.writeFileSync(path.join(REF_OUT, 'capabilities.md'), refMd);

// drop the scaffold's example pages if they're still around
for (const stale of ['src/content/docs/guides/example.md', 'src/content/docs/reference/example.md']) {
  fs.rmSync(stale, { force: true });
}
fs.rmSync('src/content/docs/guides', { recursive: true, force: true });

console.log(`✓ synced ${chapters} guide chapters + ${caps.length} capabilities from ${REPO}`);
