# mentos-team.github.io

Static website of [MentOS](https://github.com/mentos-team/MentOS), the Mentoring
Operating System — an educational 32-bit Linux-like OS developed at the
University of Verona. Published at <https://mentos-team.github.io>.

Built with [Astro](https://astro.build) and deployed to GitHub Pages by
`.github/workflows/deploy.yml` on every push to `main`.

## Quick start

```bash
npm ci          # install exactly what the lockfile says
npm run dev     # http://localhost:4321
npm run ci      # everything CI runs: check, test, build, verify
```

Node 24 or newer (`.nvmrc`).

## What lives where

| Path | What it is |
| --- | --- |
| `src/data/site.ts` | Project name, slogan, headline figures, links, licence. Start here. |
| `src/data/courses.yaml` | The sections of the Course Material page. |
| `src/data/lectures.yaml` | One entry per lecture PDF. |
| `src/content/people/` | One Markdown file per person. |
| `src/styles/tokens.css` | Every colour, size and space the site uses. |
| `src/components/`, `src/layouts/` | Astro components and page shells. |
| `src/pages/` | One file per URL. |
| `scripts/verify.mjs` | The repository invariants, enforced. |

## Two rules this repository enforces

Both are checked by `npm run verify`, so a violation fails CI rather than
sitting in the history.

**1. No published documents in this repository.** Lecture slides are release
assets of
[mentos-team/mentos-downloads](https://github.com/mentos-team/mentos-downloads),
and the website links to them. The previous version of this site committed 6 MB
of PDFs and 17 MB of generated Doxygen HTML, reaching 29 MB for what is a few
hundred kilobytes of actual website. See [docs/course-material.md](docs/course-material.md).

**2. No third-party requests.** Fonts are self-hosted and bundled at build time.
There is no analytics, no CDN and no cookie banner — the previous site loaded
Bootstrap, jQuery, Popper, Font Awesome, a cookie banner and a ShinyStat
tracker from five different origins.

## Common tasks

- **Add or replace a lecture** — [docs/course-material.md](docs/course-material.md)
- **Add or edit a person** — [docs/people.md](docs/people.md)
- **Change a colour or a size** — [docs/design.md](docs/design.md)
- **Deploy, or change how it deploys** — [docs/deployment.md](docs/deployment.md)

## Licence

The website's code is MIT, as MentOS is. The lecture slides are the work of the
MentOS team and its contributors; see
[mentos-downloads](https://github.com/mentos-team/mentos-downloads). Bundled
fonts keep their own licences — see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
