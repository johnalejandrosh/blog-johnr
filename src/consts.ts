// Datos globales del sitio. Se importan desde cualquier página con `import`.

export const SITE_TITLE = 'johnr.log';
export const SITE_TAGLINE = 'bitácora de un desarrollador';
export const SITE_DESCRIPTION =
	'Blog personal de John Alejandro, desarrollador de software. Backend, bases de datos, cloud e inteligencia artificial, con código de verdad y alguna desviación hacia la astronomía.';

export const AUTHOR = {
	name: 'John Alejandro',
	handle: 'johnr',
	initials: 'JA',
	role: 'Desarrollador de software',
	bio: 'Desarrollo software, sobre todo backend. Aquí apunto lo que aprendo, lo que me rompe la cabeza y, cuando el cielo está despejado, lo que veo por el telescopio.',
};

/** Categorías del blog. El `slug` alimenta /categoria/[slug]. */
export const CATEGORIES = [
	{ slug: 'bases-de-datos', name: 'Bases de datos' },
	{ slug: 'backend', name: 'Backend' },
	{ slug: 'arquitectura', name: 'Arquitectura' },
	{ slug: 'cloud', name: 'Cloud' },
	{ slug: 'ia', name: 'Inteligencia artificial' },
	{ slug: 'astronomia', name: 'Astronomía' },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];

export const CATEGORY_NAMES = Object.fromEntries(
	CATEGORIES.map((c) => [c.slug, c.name]),
) as Record<CategorySlug, string>;

/** Habilidades del portafolio. Cada proyecto se etiqueta con uno o más slugs. */
export const SKILLS = [
	{ slug: 'sql', name: 'SQL' },
	{ slug: 'bases-de-datos', name: 'Bases de datos' },
	{ slug: 'backend', name: 'Backend' },
	{ slug: 'nestjs', name: 'NestJS' },
	{ slug: 'microservicios', name: 'Microservicios' },
	{ slug: 'aws', name: 'AWS' },
	{ slug: 'cloud', name: 'Cloud' },
	{ slug: 'ia', name: 'IA' },
] as const;

export type SkillSlug = (typeof SKILLS)[number]['slug'];

export const SKILL_NAMES = Object.fromEntries(SKILLS.map((s) => [s.slug, s.name])) as Record<
	SkillSlug,
	string
>;
