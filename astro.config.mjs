// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// TODO: cambiar por el dominio definitivo antes de publicar (lo usan el RSS,
	// el sitemap y las URL canónicas).
	site: 'https://johnr.dev',
	integrations: [mdx(), sitemap()],
	// La página "sobre mí" vive dentro del portafolio.
	redirects: {
		'/sobre': '/portafolio',
	},
	markdown: {
		// Dos temas de Shiki: el CSS elige cuál pintar según `data-theme`.
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark-dimmed' },
			defaultColor: false,
			wrap: false,
		},
	},
	// Tipografía: JetBrains Mono para todo lo que es interfaz (titulares,
	// navegación, metadatos, código) y Source Serif 4 para el texto largo, que
	// en monoespaciada cansa a los tres párrafos.
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'JetBrains Mono',
			cssVariable: '--font-mono',
			weights: [400, 500, 700],
			styles: ['normal', 'italic'],
			subsets: ['latin', 'latin-ext'],
			fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
		},
		{
			provider: fontProviders.google(),
			name: 'Source Serif 4',
			cssVariable: '--font-serif',
			weights: [400, 600],
			styles: ['normal', 'italic'],
			subsets: ['latin', 'latin-ext'],
			fallbacks: ['Georgia', 'Cambria', 'serif'],
		},
	],
});
