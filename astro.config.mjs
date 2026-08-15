// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import keystatic from '@keystatic/astro';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // TODO: replace with the real production domain once it's registered — every
  // absolute URL (canonical, hreflang, og:image, sitemap) derives from this.
  // Must match SITE_URL in src/seo/defaults.ts.
  site: 'https://samambaiaana.com',
  output: 'server',
  i18n: {
    locales: ['pt', 'en'],
    defaultLocale: 'pt',
    routing: {
      // Portuguese stays at /, English lives under /en/.
      prefixDefaultLocale: false,
    },
  },
  adapter: cloudflare({
    imageService: 'passthrough',
  }),
  integrations: [react(), keystatic()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: import.meta.env.PROD
        ? {
            'react-dom/server': 'react-dom/server.edge',
          }
        : {},
    },
  },
});
