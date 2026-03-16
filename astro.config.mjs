import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

export default defineConfig({
  site: 'https://valekjo.github.io',
  base: '/nasi-ptaci',
  integrations: [preact()],
  vite: {
    server: {
      allowedHosts: true,
    },
  },
});
