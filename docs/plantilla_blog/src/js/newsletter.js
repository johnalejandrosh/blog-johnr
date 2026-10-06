import { Component } from '../../../src/js/index.js';

/**
 * Formulario de suscripcion.
 *
 *   <form data-ds-newsletter data-ds-newsletter-endpoint="/api/subscribe">
 *     <input type="email" name="email" required>
 *     <button type="submit">…</button>
 *     <p data-newsletter-status role="status"></p>
 *   </form>
 *
 * Sin `endpoint` funciona en modo demostracion: valida, simula el envio y
 * no hace ninguna peticion. Al conectar el blog de verdad, basta con poner
 * el atributo — no hay que tocar este archivo.
 */
export class Newsletter extends Component {
  static componentName = 'newsletter';
  static defaults = { endpoint: '' };

  init() {
    this.input = this.el.querySelector('input[type="email"]');
    this.button = this.el.querySelector('[type="submit"]');
    this.status = this.el.querySelector('[data-newsletter-status]');

    this.listen(this.el, 'submit', this.onSubmit);
    this.listen(this.input, 'input', () => this.clearError());
  }

  async onSubmit(event) {
    event.preventDefault();

    const email = this.input.value.trim();
    if (!this.isValid(email)) {
      return this.setStatus('error', 'Escribe un correo electrónico válido.');
    }

    if (!this.emit('submit', { email })) return; // cancelable desde fuera

    this.setBusy(true);
    this.setStatus('', 'Enviando…');

    try {
      if (this.options.endpoint) {
        const response = await fetch(this.options.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 700));
      }

      this.el.reset();
      this.setStatus('ok', '¡Listo! Revisa tu correo para confirmar.');
      this.emit('success', { email });
    } catch (error) {
      this.setStatus('error', 'No hemos podido suscribirte. Inténtalo de nuevo.');
      this.emit('error', { email, error });
    } finally {
      this.setBusy(false);
    }
  }

  isValid(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  setBusy(busy) {
    this.button?.setAttribute('aria-busy', String(busy));
    this.input.disabled = busy;
  }

  setStatus(state, message) {
    const isError = state === 'error';
    this.input.setAttribute('aria-invalid', String(isError));
    if (!this.status) return;
    this.status.dataset.state = state;
    this.status.textContent = message;
  }

  clearError() {
    if (this.status?.dataset.state === 'error') this.setStatus('', '');
  }
}
