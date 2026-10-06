// Cálculos de cielo que se hacen en la compilación. Nada aquí corre en el
// navegador: el sitio es estático y "hoy" es el día del build.

/** Luna nueva de referencia: 6 de enero de 2000, 18:14 UTC. */
const NEW_MOON_REF = Date.UTC(2000, 0, 6, 18, 14);
/** Mes sinódico medio, en días. */
const SYNODIC_MONTH = 29.530588853;

export type MoonPhase = {
	/** Días desde la última luna nueva. */
	age: number;
	/** Fracción iluminada del disco, 0–1. */
	illumination: number;
	name: string;
};

/**
 * Fase lunar aproximada con el mes sinódico medio. Se desvía unas horas
 * respecto a las efemérides reales, que para un pie de página sobra.
 */
export function moonPhase(date = new Date()): MoonPhase {
	const days = (date.getTime() - NEW_MOON_REF) / 86_400_000;
	const age = ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
	const angle = (age / SYNODIC_MONTH) * 2 * Math.PI;
	const illumination = (1 - Math.cos(angle)) / 2;

	const names = [
		'luna nueva',
		'creciente',
		'cuarto creciente',
		'gibosa creciente',
		'luna llena',
		'gibosa menguante',
		'cuarto menguante',
		'menguante',
	];
	const index = Math.round((age / SYNODIC_MONTH) * 8) % 8;

	return { age, illumination, name: names[index] };
}
