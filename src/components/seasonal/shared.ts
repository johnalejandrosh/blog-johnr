// Utilidades que comparten los scripts de los temas de temporada.

export const rand = (min: number, max: number) => min + Math.random() * (max - min);

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const prefersReducedMotion = () =>
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isSmallScreen = () => window.innerWidth < 640;

/** En móvil sale la mitad de cada cosa: la pantalla es pequeña y la batería también. */
export const howMany = (n: number) => (isSmallScreen() ? Math.ceil(n / 2) : n);

/** Clona el primer elemento de un `<template>` dentro de un contenedor nuevo. */
export const cloneInto = (template: HTMLTemplateElement, className: string) => {
	const box = document.createElement('div');
	box.className = className;
	box.append(template.content.cloneNode(true));
	return box;
};

/**
 * Posición del puntero en la ventana (o muy lejos si no hay).
 * En táctil solo hay posición mientras el dedo toca; al soltar se olvida, para
 * que nada siga reaccionando a un sitio donde ya no hay nada.
 */
export function trackPointer() {
	const pointer = { x: -1e4, y: -1e4 };
	const forget = () => {
		pointer.x = pointer.y = -1e4;
	};
	const track = (event: PointerEvent) => {
		pointer.x = event.clientX;
		pointer.y = event.clientY;
	};
	window.addEventListener('pointermove', track, { passive: true });
	window.addEventListener('pointerdown', track, { passive: true });
	window.addEventListener('pointerup', (event) => {
		if (event.pointerType !== 'mouse') forget();
	});
	document.documentElement.addEventListener('mouseleave', forget);
	return pointer;
}
