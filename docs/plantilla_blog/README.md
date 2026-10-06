# Plantilla Blog — MVP

Blog estático listo para usar, construido **enteramente sobre el sistema de
diseño** del repo. Tres páginas, cinco comportamientos y una plantilla de email.
Sin framework, sin dependencias de runtime.

```bash
npm run dev:blog       # http://localhost:5174
npm run build:blog     # -> dist-blog/
npm run preview:blog
```

---

## Qué incluye

| Archivo | Qué es |
|---|---|
| `index.html` | Portada: destacado, rejilla de artículos, archivo, rail lateral, newsletter |
| `articulo.html` | Artículo: índice lateral con scroll-spy, progreso de lectura, cuerpo en `ds-prose`, temas, relacionados |
| `categoria.html` | Listado filtrado con migas de pan y paginación |
| `newsletter-email.html` | Email en tablas, con la misma paleta. **No entra en el build** — se sube al proveedor de correo |
| `src/blog.scss` | Capa de composición: cabecera, tarjetas, rails, newsletter, pie |
| `src/js/` | Cinco componentes que extienden el `Component` del sistema |
| `_diseno-original/` | El diseño original de Claude Design, como referencia |

---

## Cómo se reparte el trabajo

> Las clases del **sistema** llevan prefijo `ds-`. Las de **esta plantilla**, no.
> Así se ve de un vistazo qué aporta cada capa.

Del sistema vienen tarjetas (`ds-card`), badges, botones, avatares, la rejilla
(`ds-grid`), las utilidades y —lo más importante para un blog— **`ds-prose`**,
que estiliza el cuerpo del artículo sin que el HTML de dentro lleve una sola
clase. Eso es justo lo que sale de un CMS o de Markdown:

```html
<div class="ds-prose ds-prose--lead ds-prose--dropcap">
  <p>…</p><h2>…</h2><ul>…</ul><blockquote>…</blockquote>
</div>
```

De la plantilla vienen las piezas propias de un blog: `post-card`, `post-mini`,
`archive-row`, `toc`, `newsletter`, `filter`, `site-header`, `site-footer`.
Ninguna usa un color, radio o espacio literal — todo sale de tokens, así que si
cambias la marca del sistema el blog cambia con ella.

---

## Comportamiento

Cinco componentes que extienden el `Component` del sistema y se auto-montan por
`data-attribute`. Ninguno necesita inicialización manual.

| Componente | Atributo | Qué hace |
|---|---|---|
| `ReadingProgress` | `data-ds-reading-progress` | Barra de progreso **del artículo**, no del documento |
| `Toc` | `data-ds-toc` | Índice con scroll-spy. Si el `<nav>` está vacío, lo genera desde los `h2` |
| `Newsletter` | `data-ds-newsletter` | Valida, envía y reporta estado con `aria-live` |
| `Share` | `data-ds-share` | Web Share API en móvil, copiar al portapapeles en escritorio |
| `ThemeSwitch` | `data-ds-theme-switch` | Claro / oscuro / automático, persistido |

Dos decisiones que conviene conocer:

- **El progreso mide el artículo.** Con cabecera, pie y relacionados, el scroll
  del documento marca 60 % cuando el texto ya se ha acabado.
- **El índice se genera solo.** En un blog real el cuerpo viene de un CMS y no
  trae índice; basta con que los `h2` tengan `id`.

---

## Conectarlo de verdad

### Newsletter

Sin `endpoint` funciona en modo demostración: valida y simula el envío. Para
conectarlo, un atributo — no hay que tocar JavaScript:

```html
<form data-ds-newsletter data-ds-newsletter-endpoint="/api/subscribe">
```

Envía `POST` con `{ "email": "..." }` y espera un 2xx. También emite eventos
cancelables por si necesitas engancharte:

```js
document.addEventListener('ds:newsletter:success', (e) => analytics.track('subscribe', e.detail));
```

### Imágenes

Los huecos de portada son `<div class="post-card__cover cover--empty" data-label="16:10">`.
Mete un `<img>` dentro y el marcador desaparece solo:

```html
<div class="post-card__cover">
  <img src="/img/portada.jpg" alt="Descripción real de la imagen" />
</div>
```

### Contenido

Las tres páginas son HTML plano a propósito: se pueden pegar tal cual en
Astro, Eleventy, Hugo, Next o un WordPress headless. Lo que hay que sustituir
por un bucle está siempre dentro de un `ds-grid` o un `ds-stack--ruled`.

### Extraer la plantilla a su propio proyecto

`src/main.js` importa el sistema desde el código fuente para poder trabajar los
dos a la vez con recarga en caliente. Al sacar el blog a un repo propio, cambia
las dos primeras líneas por:

```js
import 'ale-design-system';
import { register, mount, observe } from 'ale-design-system';
```

---

## Lo que falta para pasar de MVP a producción

Deliberadamente fuera del alcance de un MVP, en orden de importancia:

1. **Datos reales.** Hoy el contenido está escrito en el HTML. El siguiente paso
   es una fuente (Markdown, CMS) y un bucle.
2. **SEO y compartir.** Faltan Open Graph, Twitter Card, `canonical`, JSON-LD de
   `Article` y `sitemap.xml`. Son ~15 líneas en el `<head>` de cada página.
3. **`feed.xml`.** El pie ya enlaza a RSS, pero el fichero no existe.
4. **Búsqueda.** Los filtros de categoría son enlaces, no filtran de verdad.
5. **Paginación real** en `categoria.html`.
6. **Página 404** y página de autor.
