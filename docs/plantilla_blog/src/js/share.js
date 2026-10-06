import { Component } from '../../../src/js/index.js';

/**
 * Botón de compartir.
 *
 *   <button data-ds-share data-ds-share-title="Título del artículo">Compartir</button>
 *
 * Usa la Web Share API cuando existe (móvil) y cae a copiar el enlace en el
 * portapapeles. El texto del botón confirma la acción y se restaura solo.
 */
export class Share extends Component {
  static componentName = 'share';
  static defaults = { title: '', url: '' };

  init() {
    this.label = this.el.querySelector('[data-share-label]') ?? this.el;
    this.original = this.label.textContent;
    this.listen(this.el, 'click', this.onClick);
    this.onDestroy(() => clearTimeout(this.timer));
  }

  async onClick() {
    const url = this.options.url || window.location.href;
    const title = this.options.title || document.title;

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      this.flash('¡Enlace copiado!');
    } catch (error) {
      // AbortError = el usuario cerró la hoja de compartir. No es un fallo.
      if (error?.name !== 'AbortError') this.flash('No se pudo copiar');
    }
  }

  flash(message) {
    clearTimeout(this.timer);
    this.label.textContent = message;
    this.timer = setTimeout(() => {
      this.label.textContent = this.original;
    }, 2000);
  }
}
