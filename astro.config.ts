// Astro configuration for the MentOS website (static, GitHub Pages).
// See README.md for the project overview and docs/deployment.md for build and deployment.
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Organisation Pages repository (mentos-team.github.io) => served at the domain root.
  site: 'https://mentos-team.github.io',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    // One folder per page (team/index.html) so URLs end with a slash.
    format: 'directory',
  },
  image: {
    // Responsive <Image> output by default (srcset + sizes) with cropping to the box.
    layout: 'constrained',
    responsiveStyles: true,
  },
  integrations: [sitemap()],
});
