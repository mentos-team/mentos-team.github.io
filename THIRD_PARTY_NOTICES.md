# Third-party notices

This website bundles the following third-party assets. Everything is served from
this origin — there are no CDN or analytics requests at runtime.

## Fonts

### Inter

Copyright 2016 The Inter Project Authors (<https://github.com/rsms/inter>).
Licensed under the SIL Open Font License, Version 1.1.

Vendored as `src/assets/fonts/inter-latin-wght-normal.woff2` (Latin subset,
variable weight), via [Fontsource](https://fontsource.org/fonts/inter).

### IBM Plex Serif and IBM Plex Mono

Copyright 2017 IBM Corp. Licensed under the SIL Open Font License, Version 1.1.

Installed as the `@fontsource/ibm-plex-serif` and `@fontsource/ibm-plex-mono`
packages and bundled at build time (Latin and Latin Extended subsets).

The SIL Open Font License 1.1 is available at
<https://openfontlicense.org/open-font-license-official-text/>.

## Design system

The type scale, spacing scale and layout system are taken from
[esd-univr.github.io](https://github.com/esd-univr/esd-univr.github.io), which
shares an author with this repository. Used with permission; see
[docs/design.md](docs/design.md) for what was kept and what was changed.

## Build tooling

Astro, Sharp, the `yaml` package and their dependencies are development
dependencies, listed in `package.json` with their own licences in
`node_modules`. None of them ships code to the browser: the output is static
HTML, CSS and one small inline script.
