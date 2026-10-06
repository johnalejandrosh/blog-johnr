# johnr.log

Blog personal de John Alejandro: desarrollo de software, backend, bases de datos,
cloud e inteligencia artificial, con toques de astronomía. Construido con
[Astro](https://astro.build).

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm install` | Instala dependencias |
| `astro dev --background` | Servidor de desarrollo en `localhost:4321` |
| `npm run build` | Compila el sitio a `./dist/` |
| `npm run preview` | Sirve lo compilado, para revisar antes de publicar |

## Estructura

```text
src/
├── components/         Piezas reutilizables (tarjeta, carta celeste, portada generada…)
├── content/blog/       Los artículos, en Markdown
├── content/projects/   Los proyectos del portafolio, en Markdown
├── layouts/            BaseLayout (páginas) y BlogPost (artículos)
├── lib/posts.ts        Consultas a las colecciones
├── lib/constellation.ts Portadas: una constelación generada a partir del slug
├── lib/sky.ts          Fase lunar del día del build (pie de página)
├── pages/              Rutas del sitio (/blog, /categoria, /portafolio)
├── styles/global.css   Todos los tokens y estilos. No hay framework de CSS
└── consts.ts           Nombre, autor, categorías y habilidades
```

## Publicar un artículo

Crea un `.md` en `src/content/blog/`. El nombre del archivo es la URL
(`mi-articulo.md` → `/blog/mi-articulo/`):

```yaml
---
title: 'Título del artículo'
description: 'Una o dos frases. Salen en la tarjeta, en el buscador y en redes.'
pubDate: '2026-10-12'
category: 'backend' # bases-de-datos | backend | arquitectura | cloud | ia | astronomia
tags: ['nestjs', 'typescript']
featured: false # opcional: fija el artículo como "última entrada" en la portada
# heroImage: '../../assets/blog/imagen.jpg'  # opcional; sin ella se genera una carta celeste
---
```

Las secciones van con `##`: el índice lateral se arma solo a partir de ellas.

## Añadir un proyecto al portafolio

Crea un `.md` en `src/content/projects/`. Las `skills` son los filtros de
`/portafolio` y deben existir en `SKILLS` (`src/consts.ts`):

```yaml
---
title: 'Nombre del proyecto'
summary: 'Qué hace, en una o dos frases.'
skills: ['backend', 'nestjs']
stack: ['NestJS', 'PostgreSQL']
year: 2026
status: 'terminado' # ejemplo | en-curso | terminado
repo: 'https://github.com/...'
order: 1
---
```

Mientras quede algún proyecto con `status: 'ejemplo'`, la página muestra el aviso
de "en construcción".
