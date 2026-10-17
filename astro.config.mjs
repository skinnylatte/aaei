// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // The homepage is being redesigned; until then it sends people to Workshops.
  redirects: { '/': '/workshops/' },
});
