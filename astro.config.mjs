// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import rehypeSlug from 'rehype-slug';

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
  markdown: {
    rehypePlugins: [rehypeSlug],
  },
  integrations: [
    mdx({
      rehypePlugins: [rehypeSlug],
    }),
    sitemap({
      i18n: { defaultLocale: 'fr', locales: { fr: 'fr-FR' } },
      changefreq: ChangeFreqEnum.MONTHLY,
      priority: 0.7,
      serialize(item) {
        if (item.url === 'https://mesdonneeslocales.fr/') {
          item.priority = 1.0;
          item.changefreq = ChangeFreqEnum.WEEKLY;
        } else if (/\/cartographies\/qualite-eau\/(\d{5}|2[AB]\d{3})\//.test(item.url)) {
          // Pages communes individuelles — priorité modérée car volume important
          item.priority = 0.6;
          item.changefreq = ChangeFreqEnum.MONTHLY;
        } else if (item.url.includes('/cartographies/')) {
          item.priority = 0.9;
          item.changefreq = ChangeFreqEnum.WEEKLY;
        } else if (item.url.endsWith('/methodologie/')) {
          item.priority = 0.9;
          item.changefreq = ChangeFreqEnum.MONTHLY;
        } else if (item.url.endsWith('/carte-france/')) {
          item.priority = 0.8;
          item.changefreq = ChangeFreqEnum.WEEKLY;
        } else if (item.url.endsWith('/a-propos/')) {
          item.priority = 0.8;
          item.changefreq = ChangeFreqEnum.MONTHLY;
        } else if (item.url.endsWith('/faq/') || item.url.endsWith('/je-participe/')) {
          item.priority = 0.7;
          item.changefreq = ChangeFreqEnum.MONTHLY;
        } else if (item.url.endsWith('/contact/')) {
          item.priority = 0.5;
          item.changefreq = ChangeFreqEnum.YEARLY;
        } else if (item.url.endsWith('/accessibilite/')) {
          item.priority = 0.4;
          item.changefreq = ChangeFreqEnum.YEARLY;
        } else if (item.url.endsWith('/plan-du-site/')) {
          item.priority = 0.3;
          item.changefreq = ChangeFreqEnum.MONTHLY;
        } else if (
          item.url.endsWith('/mentions-legales/') ||
          item.url.endsWith('/confidentialite/')
        ) {
          item.priority = 0.3;
          item.changefreq = ChangeFreqEnum.YEARLY;
        }
        return item;
      },
      filter: (page) => !page.includes('/404') && !page.endsWith('/llms.txt'),
    }),
  ],
});
