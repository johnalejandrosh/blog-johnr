import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORIES, SKILLS } from './consts';

const categorySlugs = CATEGORIES.map((c) => c.slug) as [string, ...string[]];
const skillSlugs = SKILLS.map((s) => s.slug) as [string, ...string[]];

const blog = defineCollection({
	// Carga los archivos Markdown y MDX de `src/content/blog/`.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Valida el frontmatter con un esquema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Convierte la cadena en objeto Date
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			/** Opcional: sin imagen, la portada es una carta celeste generada. */
			heroImage: z.optional(image()),
			/** Texto alternativo de la portada. Vacío = imagen decorativa. */
			heroImageAlt: z.string().optional(),
			/** Autoría de la portada, para el pie de foto del artículo. */
			heroImageCredit: z.string().optional(),
			/** Slug de categoría; debe existir en CATEGORIES. */
			category: z.enum(categorySlugs),
			tags: z.array(z.string()).default([]),
			/** Solo uno debería llevarlo: es el que abre la portada. */
			featured: z.boolean().default(false),
		}),
});

const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		/** Slugs de SKILLS: son los filtros del portafolio. */
		skills: z.array(z.enum(skillSlugs)).min(1),
		stack: z.array(z.string()).default([]),
		year: z.number().int(),
		/** `ejemplo` = maqueta; se marca como tal en la página. */
		status: z.enum(['ejemplo', 'en-curso', 'terminado']).default('ejemplo'),
		repo: z.string().url().optional(),
		demo: z.string().url().optional(),
		/** Orden manual: menor primero. */
		order: z.number().default(100),
	}),
});

export const collections = { blog, projects };
