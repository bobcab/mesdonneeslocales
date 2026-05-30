// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://mesdonneeslocales.fr',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'fr', locales: { fr: 'fr-FR' } },
      changefreq: 'monthly',
      priority: 0.7,
      serialize(item) {
        if (item.url === 'https://mesdonneeslocales.fr/') {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        } else if (/\/cartographies\/qualite-eau\/(\d{5}|2[AB]\d{3})\//.test(item.url)) {
          // Pages communes individuelles — priorité modérée car volume important
          item.priority = 0.6;
          item.changefreq = 'monthly';
        } else if (item.url.includes('/cartographies/')) {
          item.priority = 0.9;
          item.changefreq = 'weekly';
        } else if (item.url.endsWith('/methodologie/')) {
          item.priority = 0.9;
          item.changefreq = 'monthly';
        } else if (item.url.endsWith('/carte-france/')) {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        } else if (item.url.endsWith('/a-propos/')) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        } else if (item.url.endsWith('/faq/') || item.url.endsWith('/je-participe/')) {
          item.priority = 0.7;
          item.changefreq = 'monthly';
        } else if (item.url.endsWith('/contact/')) {
          item.priority = 0.5;
          item.changefreq = 'yearly';
        } else if (item.url.endsWith('/accessibilite/')) {
          item.priority = 0.4;
          item.changefreq = 'yearly';
        } else if (item.url.endsWith('/plan-du-site/')) {
          item.priority = 0.3;
          item.changefreq = 'monthly';
        } else if (
          item.url.endsWith('/mentions-legales/') ||
          item.url.endsWith('/confidentialite/')
        ) {
          item.priority = 0.3;
          item.changefreq = 'yearly';
        }
        return item;
      },
      filter: (page) => !page.includes('/404') && !page.endsWith('/llms.txt'),
    }),
  ],
});
