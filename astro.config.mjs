// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://mobiler.rs',
	integrations: [
		starlight({
			title: 'Mobiler',
			description: 'Build native iOS, Android and web apps from one Rust core.',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/mobiler/mobiler' }],
			sidebar: [
				{ label: 'Start here', items: [{ label: 'Quickstart', slug: 'quickstart' }] },
				{ label: 'Guide: build Saldo', items: [{ autogenerate: { directory: 'guide' } }] },
				{ label: 'Reference', items: [{ autogenerate: { directory: 'reference' } }] },
			],
		}),
	],
});
