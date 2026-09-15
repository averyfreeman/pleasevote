// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const base = (process.env.BASE_PATH || '/pleasevote').replace(/\/$/, '') || '/';

export default defineConfig({
  base,
  site: 'https://averyfreeman.github.io',
  integrations: [
    starlight({
      title: 'PLEASE VOTE™',
      description: 'Reliable election and voter information in one focused web app.',
      disable404Route: true,
      customCss: ['./src/styles/custom.css'],
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/averyfreeman/pleasevote' }],
      sidebar: [
        {
          label: 'Start here',
          items: [
            { label: 'Overview', link: '/' },
            { label: 'Voter information flow', slug: 'workflow' },
          ],
        },
        {
          label: 'Reference',
          items: [{ label: 'API and data model', slug: 'reference' }],
        },
        {
          label: 'Contributing',
          items: [{ label: 'Development', slug: 'development' }],
        },
      ],
    }),
  ],
});
