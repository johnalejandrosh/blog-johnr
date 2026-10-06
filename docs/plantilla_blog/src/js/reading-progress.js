import { Component } from '../../../src/js/index.js';

/**
 * Barra de progreso de lectura.
 *
 *   <div data-ds-reading-progress data-ds-reading-progress-target="#articulo"></div>
 *
 * Mide el avance dentro del ARTICULO, no de la pagina: con la cabecera, el
 * pie y los relacionados, el scroll de documento marca 60 % cuando el texto
 * ya se ha terminado.
 */
export class ReadingProgress extends Component {
  static componentName = 'reading-progress';
  static defaults = { target: 'article' };

  init() {
    this.article = document.querySelector(this.options.target);
    if (!this.article) return;

    this.el.setAttribute('role', 'progressbar');
    this.el.setAttribute('aria-label', 'Progreso de lectura');
    this.el.setAttribute('aria-valuemin', '0');
    this.el.setAttribute('aria-valuemax', '100');

    this.update = this.update.bind(this);
    this.listen(window, 'scroll', this.onScroll, { passive: true });
    this.listen(window, 'resize', this.onScroll, { passive: true });
    this.update();
  }

  // El scroll dispara muy seguido: el trabajo real se hace en un frame.
  onScroll() {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = null;
      this.update();
    });
  }

  update() {
    const box = this.article.getBoundingClientRect();
    const scrolled = -box.top;
    const total = box.height - window.innerHeight;
    const ratio = total > 0 ? Math.min(Math.max(scrolled / total, 0), 1) : 0;

    this.el.style.setProperty('--progress', ratio.toFixed(4));
    this.el.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
  }

  destroy() {
    if (this.frame) cancelAnimationFrame(this.frame);
    super.destroy();
  }
}
