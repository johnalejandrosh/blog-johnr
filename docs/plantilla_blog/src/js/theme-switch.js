import { Component } from '../../../src/js/index.js';
import { Theme } from '../../../src/js/core/theme.js';
import { qsa } from '../../../src/js/core/dom.js';

/**
 * Grupo de botones de tema.
 *
 *   <div data-ds-theme-switch>
 *     <button data-theme="light">Claro</button>
 *     <button data-theme="dark">Oscuro</button>
 *     <button data-theme="system">Auto</button>
 *   </div>
 *
 * El estado se refleja con aria-pressed, que es lo que el CSS del sistema ya
 * estiliza en `ds-button-group`.
 */
export class ThemeSwitch extends Component {
  static componentName = 'theme-switch';

  init() {
    this.buttons = qsa('[data-theme]', this.el);

    this.buttons.forEach((button) => {
      this.listen(button, 'click', () => Theme.set(button.dataset.theme));
    });

    this.listen(document.documentElement, 'ds:theme:change', this.sync);
    this.sync();
  }

  sync() {
    this.buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.theme === Theme.mode));
    });
  }
}
