import { Component } from '../../../src/js/index.js';
import { qsa } from '../../../src/js/core/dom.js';

/**
 * Indice del articulo con scroll-spy.
 *
 *   <nav data-ds-toc data-ds-toc-target="#articulo">
 *     <a class="toc__link" href="#seccion-1">…</a>
 *   </nav>
 *
 * Si el <nav> esta vacio, el indice se GENERA a partir de los h2 del
 * articulo: en un blog real el cuerpo viene de un CMS y no trae índice.
 */
export class Toc extends Component {
  static componentName = 'toc';
  static defaults = { target: 'article', headings: 'h2' };

  init() {
    this.article = document.querySelector(this.options.target);
    if (!this.article) return;

    this.headings = qsa(this.options.headings, this.article).filter((h) => h.id);
    if (!this.headings.length) return;

    if (!this.el.querySelector('a')) this.build();

    this.links = new Map(
      qsa('a[href^="#"]', this.el).map((a) => [a.getAttribute('href').slice(1), a]),
    );

    this.observe();
  }

  /** Genera los enlaces cuando el contenedor viene vacio. */
  build() {
    this.el.innerHTML = this.headings
      .map((h) => `<a class="toc__link" href="#${h.id}">${h.textContent.trim()}</a>`)
      .join('');
  }

  observe() {
    // La banda superior de la ventana es la que decide la seccion activa:
    // el titular que acabas de pasar es el que estas leyendo.
    this.io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.visible.set(entry.target.id, entry.isIntersecting);
        });
        this.highlight();
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );

    this.visible = new Map();
    this.headings.forEach((h) => this.io.observe(h));
    this.onDestroy(() => this.io.disconnect());

    // Al llegar al final del documento, la ultima seccion gana: puede que
    // nunca cruce la banda si es mas corta que la ventana.
    this.listen(window, 'scroll', this.onScroll, { passive: true });
  }

  onScroll() {
    const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
    if (atBottom) this.setActive(this.headings[this.headings.length - 1].id);
  }

  highlight() {
    const active = this.headings.find((h) => this.visible.get(h.id));
    if (active) this.setActive(active.id);
  }

  setActive(id) {
    if (id === this.activeId) return;
    this.activeId = id;

    this.links.forEach((link, key) => {
      const on = key === id;
      link.classList.toggle('is-active', on);
      if (on) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });

    this.emit('change', { id });
  }
}
