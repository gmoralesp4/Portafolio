import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://gmoralesp4.github.io',
  base: '/Portafolio',
  output: 'static',
  integrations: [
    tailwind(),
    sitemap(),
  ],
});
