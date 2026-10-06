/**
 * Entrada de la plantilla de blog.
 *
 * Importa el sistema de diseño DESDE EL CÓDIGO FUENTE para poder trabajar los
 * dos a la vez con recarga en caliente. Al extraer esta plantilla a un proyecto
 * propio, cambia las dos primeras importaciones por:
 *
 *   import 'ale-design-system';
 *   import { register, mount } from 'ale-design-system';
 */
import '../../src/index.js';
import { register, mount, observe } from '../../src/js/index.js';

import './blog.scss';

import { ReadingProgress } from './js/reading-progress.js';
import { Toc } from './js/toc.js';
import { Newsletter } from './js/newsletter.js';
import { Share } from './js/share.js';
import { ThemeSwitch } from './js/theme-switch.js';

// Registrar = que el sistema los monte solo al encontrar su data-attribute.
[ReadingProgress, Toc, Newsletter, Share, ThemeSwitch].forEach(register);

// El sistema ya arrancó al importarlo, así que estos se montan ahora.
mount(document);
observe(document.body);
