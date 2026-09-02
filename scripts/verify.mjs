#!/usr/bin/env node
/**
 * Repository and build checks, run after `astro build` (see `npm run ci`).
 *
 * These are the invariants that made this website worth rebuilding. The previous version
 * grew to 29 MB of committed binaries and loaded five third-party scripts, including an
 * analytics tracker nobody remembered adding. A comment saying "do not commit PDFs" does
 * not stop that; a failing build does.
 *
 * Each check prints one line and the script exits non-zero if any fails.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..');
const dist = path.join(root, 'dist');

let failures = 0;
const pass = (message) => console.log(`  ok    ${message}`);
const fail = (message) => {
  console.error(`  FAIL  ${message}`);
  failures += 1;
};
const check = (name, fn) => {
  console.log(`\n${name}`);
  try {
    fn();
  } catch (error) {
    fail(error.message);
  }
};

/** Every file in a tree, skipping the directories that are not ours to police. */
const SKIP = new Set(['node_modules', '.git', 'dist', '.astro']);
const walk = (dir, base = dir) => {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, base));
    else out.push({ rel: path.relative(base, full), full, size: fs.statSync(full).size });
  }
  return out;
};

const sources = walk(root);
const built = fs.existsSync(dist) ? walk(dist, dist) : [];
const html = built.filter((f) => f.rel.endsWith('.html')).map((f) => ({ ...f, text: fs.readFileSync(f.full, 'utf8') }));

// --------------------------------------------------------------------------------------

check('Source tree carries no published documents', () => {
  /*
   * The whole point of mentos-team/mentos-downloads. A PDF here is a PDF in the git
   * history forever, which is how the previous repository reached 29 MB.
   */
  const documents = sources.filter((f) => /\.(pdf|pptx?|docx?|zip|tar\.gz|tgz)$/i.test(f.rel));
  if (documents.length > 0) {
    fail(`${documents.length} document(s) committed; publish them as release assets instead:`);
    for (const doc of documents) console.error(`          ${doc.rel}`);
  } else {
    pass('no PDFs, slide decks or archives in the source tree');
  }
});

check('Source tree carries no generated API documentation', () => {
  // The old repository committed 17 MB of Doxygen HTML, stale against a source tree
  // that had moved on. It is generated with `make doc` from the source repository now.
  const generated = sources.filter((f) => /(^|\/)doxygen(\/|$)/i.test(f.rel));
  if (generated.length > 0) fail(`${generated.length} file(s) under a doxygen/ directory`);
  else pass('no committed Doxygen output');
});

check('No source file is unreasonably large', () => {
  const LIMIT = 256 * 1024;
  const heavy = sources.filter((f) => f.size > LIMIT && f.rel !== 'package-lock.json');
  if (heavy.length > 0) {
    fail(`file(s) over ${LIMIT / 1024} KB:`);
    for (const f of heavy) console.error(`          ${f.rel} (${Math.round(f.size / 1024)} KB)`);
  } else {
    pass(`every source file is under ${LIMIT / 1024} KB`);
  }
});

check('Build output fits its budget', () => {
  if (built.length === 0) throw new Error('dist/ is missing — run `astro build` first');
  const BUDGET = 3 * 1024 * 1024;
  const total = built.reduce((sum, f) => sum + f.size, 0);
  const mb = (total / 1024 / 1024).toFixed(2);
  if (total > BUDGET) fail(`dist/ is ${mb} MB, over the ${BUDGET / 1024 / 1024} MB budget`);
  else pass(`dist/ is ${mb} MB across ${built.length} files`);
});

check('No third-party requests', () => {
  /*
   * The previous site pulled Bootstrap, jQuery, Popper, Font Awesome, a cookie banner and
   * a ShinyStat analytics tracker from five different CDNs. This site self-hosts its
   * fonts and ships no analytics, and that is meant to stay true: any absolute src/href
   * on a script, stylesheet, image, iframe or font is a failure.
   */
  /*
   * The site's own host is not third party. It appears in absolute form on purpose —
   * <link rel="canonical"> has to be absolute, and so do the Open Graph URLs — so it is
   * allowed here rather than the check being loosened to only look at <script>.
   */
  const OWN_HOST = 'mentos-team.github.io';
  const offenders = [];
  for (const page of html) {
    const pattern = /<(?:script|link|img|iframe|source)\b[^>]*\b(?:src|href)\s*=\s*["'](https?:)?\/\/([^"'/]+)/gi;
    for (const match of page.text.matchAll(pattern)) {
      if (match[2] === OWN_HOST) continue;
      offenders.push(`${page.rel}: ${match[2]}`);
    }
  }
  if (offenders.length > 0) {
    fail('external asset request(s):');
    for (const o of offenders) console.error(`          ${o}`);
  } else {
    pass('every script, style, font and image is served from this origin');
  }
});

check('No analytics or tracking', () => {
  const BANNED = ['shinystat', 'google-analytics', 'googletagmanager', 'gtag(', 'hotjar', 'matomo', 'plausible', 'fbq('];
  const hits = [];
  for (const page of html) {
    const lower = page.text.toLowerCase();
    for (const needle of BANNED) if (lower.includes(needle)) hits.push(`${page.rel}: ${needle}`);
  }
  if (hits.length > 0) {
    fail('tracking code found:');
    for (const h of hits) console.error(`          ${h}`);
  } else {
    pass('no analytics or tracking code');
  }
});

check('Course material links point at published release assets', () => {
  const page = html.find((f) => f.rel.startsWith('course-material'));
  if (!page) throw new Error('course-material page was not built');
  const expected = /^https:\/\/github\.com\/mentos-team\/mentos-downloads\/releases\/download\/(os-course|mentos-course)\/[A-Za-z0-9._-]+\.pdf$/;
  const links = [...page.text.matchAll(/href="([^"]*\.pdf)"/g)].map((m) => m[1]);
  if (links.length === 0) throw new Error('no PDF links on the course material page');
  const wrong = links.filter((href) => !expected.test(href));
  if (wrong.length > 0) {
    fail('link(s) not matching the release-asset URL shape:');
    for (const w of wrong) console.error(`          ${w}`);
  } else {
    pass(`${links.length} lecture links, all release assets`);
  }
});

check('Internal links resolve to a built page', () => {
  const targets = new Set(built.map((f) => `/${f.rel}`));
  const exists = (href) => {
    const clean = href.split('#')[0].split('?')[0];
    if (clean === '' || clean === '/') return targets.has('/index.html');
    const trimmed = clean.endsWith('/') ? clean.slice(0, -1) : clean;
    return targets.has(clean) || targets.has(`${trimmed}/index.html`) || targets.has(trimmed);
  };
  const broken = [];
  for (const page of html) {
    for (const match of page.text.matchAll(/href="(\/[^"]*)"/g)) {
      const href = match[1];
      if (href.startsWith('//')) continue;
      if (!exists(href)) broken.push(`${page.rel} -> ${href}`);
    }
  }
  if (broken.length > 0) {
    fail('broken internal link(s):');
    for (const b of broken) console.error(`          ${b}`);
  } else {
    pass('every internal link has a target');
  }
});

check('The pieces GitHub Pages needs are present', () => {
  const required = ['index.html', '404.html', 'robots.txt', 'sitemap-index.xml', 'favicon.ico', '.nojekyll'];
  const missing = required.filter((f) => !fs.existsSync(path.join(dist, f)));
  if (missing.length > 0) fail(`missing from dist/: ${missing.join(', ')}`);
  else pass(required.join(', '));
});

check('Every page has a title and a description', () => {
  const bad = [];
  for (const page of html) {
    if (!/<title>[^<]{4,}<\/title>/.test(page.text)) bad.push(`${page.rel}: no title`);
    if (!/<meta name="description" content="[^"]{20,}"/.test(page.text)) bad.push(`${page.rel}: no description`);
  }
  if (bad.length > 0) {
    fail('metadata missing:');
    for (const b of bad) console.error(`          ${b}`);
  } else {
    pass(`${html.length} pages, all with a title and a description`);
  }
});

// --------------------------------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('\nAll checks passed.');
