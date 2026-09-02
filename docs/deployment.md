# Build and deployment

## How it deploys

`.github/workflows/deploy.yml` runs on every push to `main`: it installs from
the lockfile, runs the checks, tests, build and verify, uploads `dist/` as a
Pages artifact, and deploys it. `.github/workflows/ci.yml` runs the same
sequence on pull requests without deploying.

The repository's Pages source must be set to **GitHub Actions**, not to a
branch. The previous incarnation of this repository served `master` from the
repository root, which is why `doc/` and `doc/doxygen/` had to be committed in
the first place — anything the site served had to exist as a file on a branch.
With Actions as the source, `dist/` is built and uploaded instead, and the
repository only holds sources.

To set or check it:

```bash
gh api repos/mentos-team/mentos-team.github.io/pages          # current setting
gh api -X POST repos/mentos-team/mentos-team.github.io/pages \
    -f build_type=workflow                                    # if not yet configured
```

## Running it locally

```bash
npm ci
npm run dev       # http://localhost:4321, hot reload
npm run build     # writes dist/
npm run preview   # serve dist/ as it will be served in production
npm run ci        # check + test + build + verify, exactly as CI does
```

`npm run ci` is the one to run before pushing.

## What `verify` enforces

`scripts/verify.mjs` runs after the build and checks the invariants that made
this rebuild worth doing:

| Check | Why |
| --- | --- |
| No PDFs, slide decks or archives in the source tree | They belong in [mentos-downloads](https://github.com/mentos-team/mentos-downloads) as release assets |
| No committed Doxygen output | 17 MB of it, stale, in the old repository |
| No source file over 256 KB | Catches the next large binary before it lands |
| `dist/` under 3 MB | The site is a few hundred kilobytes; a jump means something got committed |
| No third-party requests | The old site loaded five CDNs |
| No analytics or tracking | The old site shipped a ShinyStat tracker |
| Course links match the release-asset URL shape | A typo here 404s and nothing else would notice |
| Internal links resolve to a built page | Catches a renamed route |
| `robots.txt`, `sitemap-index.xml`, `404.html`, `favicon.ico`, `.nojekyll` present | Pages needs them |
| Every page has a title and a description | |

## Replacing the mark

The mark is one file: `src/assets/logo_mentos.png`, imported by
`Header.astro` so Astro fingerprints it and emits its dimensions. It carries its
own near-black ground — the glyph inside it is cream, which would vanish on
light paper — so it is a self-contained badge and needs no light/dark pair.

To replace it:

1. Crop to the badge, apply a rounded-corner alpha mask, and quantise. The
   current file is 512×512 and 9.4 KB; the unquantised original was 214 KB, and
   at 32 colours the difference is invisible because the mark is flat colour.
2. Regenerate `public/favicon.ico` from it at 16, 32 and 48 px.
3. If the new mark's green differs, re-derive the accent from its hue and run
   `npm test` — the contrast tests are the gate. See
   [design.md](design.md).

## Legacy URLs

Two paths from the old site are gone and are handled by `404.astro` rather than
by redirects, because Pages cannot redirect a static path and stub pages for
sixteen PDFs would be worse than one clear page:

- `/doc/*.pdf` — now release assets, listed on `/course-material/`
- `/doc/doxygen/*` — no longer published; `make doc` generates it from the source
