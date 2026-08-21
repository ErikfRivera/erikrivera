// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// `site` must stay in sync with ERIK.canonicalUrl in src/data/entity.ts.
// Non-www 301s to www are configured in the Vercel domain settings.
export default defineConfig({
  site: 'https://www.erikrivera.com',
  build: { format: 'file' },
  trailingSlash: 'never',
  integrations: [
    // Emits the root as `https://www.erikrivera.com` (no path). An empty path
    // is equivalent to `/` per RFC 3986 6.2.3, so this matches the canonical
    // tag. Vercel enforces the no-slash shape for /about and /press.
    sitemap(),
  ],
});
