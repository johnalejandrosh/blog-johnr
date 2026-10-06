import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORY_NAMES, type CategorySlug } from '../consts';

export type Post = CollectionEntry<'blog'>;
export type Project = CollectionEntry<'projects'>;

/** Todos los artículos, del más reciente al más antiguo. */
export async function getPosts(): Promise<Post[]> {
	const posts = await getCollection('blog');
	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Proyectos del portafolio por `order` y, a igualdad, por año descendente. */
export async function getProjects(): Promise<Project[]> {
	const projects = await getCollection('projects');
	return projects.sort((a, b) => a.data.order - b.data.order || b.data.year - a.data.year);
}

/** El destacado de portada: el marcado con `featured`, o el más reciente. */
export function pickFeatured(posts: Post[]): Post | undefined {
	return posts.find((p) => p.data.featured) ?? posts[0];
}

export function byCategory(posts: Post[], slug: CategorySlug): Post[] {
	return posts.filter((p) => p.data.category === slug);
}

export function categoryName(slug: string): string {
	return CATEGORY_NAMES[slug as CategorySlug] ?? slug;
}

/** Minutos de lectura a 200 palabras por minuto, mínimo 1. Ignora el código. */
export function readingTime(body = ''): number {
	const prose = body.replace(/```[\s\S]*?```/g, ' ');
	const words = prose.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 200));
}

/** `2026-10-05`, en UTC para que coincida con el frontmatter. */
export function isoDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

export function postUrl(post: Post): string {
	return `/blog/${post.id}/`;
}

export function categoryUrl(slug: string): string {
	return `/categoria/${slug}/`;
}
