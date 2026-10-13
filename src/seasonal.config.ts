// Temas de temporada: decoraciones que se ponen ENCIMA de la página sin tocar
// el diseño de abajo (ni colores, ni tipografía, ni el tema claro/oscuro).
// Viven en una capa fija que no recibe clics, así que nada deja de funcionar.
//
// Cada tema tiene su temporada (`season`). Al compilar se activa el que toque
// según la fecha de ese día; fuera de toda temporada no sale ninguno. Además,
// si una temporada termina y nadie recompila, el navegador lo quita solo al
// día siguiente del fin (pero para que EMPIECE una temporada hay que compilar
// ese día o después).
//
// Añadir un tema nuevo = una entrada aquí + su componente en
// `src/components/seasonal/` + una línea en `SeasonalOverlay.astro`.

/** Zona horaria con la que se decide qué día es hoy. */
export const SEASONAL_TIMEZONE = 'America/Bogota';

/**
 * Para probar o salirse del calendario:
 * - `null`: automático, según las fechas de cada tema (lo normal).
 * - `'october'`, `'christmas'`…: fuerza ese tema, sea la fecha que sea.
 * - `'none'`: ningún tema, sea la fecha que sea.
 */
export const SEASONAL_OVERRIDE: SeasonalThemeId | 'none' | null = null;

/** Día del año como `'MM-DD'`, con ceros: `'10-01'`, `'12-24'`. */
type MonthDay = `${number}${number}-${number}${number}`;

type Season = {
	/** Primer día de la temporada, incluido. */
	from: MonthDay;
	/** Último día de la temporada, incluido. Puede ser del año siguiente
	 *  (`from: '12-01', until: '01-06'` cruza el Año Nuevo). */
	until: MonthDay;
};

type SeasonalTheme = {
	/** `false` apaga el tema aunque estemos en su temporada. */
	enabled: boolean;
	season: Season;
	options: Record<string, number | boolean>;
};

/** Si dos temporadas se solapan, gana la que aparece primero en esta lista. */
export const SEASONAL_THEMES = {
	/** Octubre / Halloween. */
	october: {
		enabled: true,
		season: { from: '10-01', until: '10-31' },
		options: {
			/** Arañas que cruzan la pantalla caminando. En móvil salen la mitad. */
			walkers: 5,
			/** Arañas que bajan colgadas de su hilo desde el borde superior. */
			hanging: 2,
			/** Telarañas en las esquinas superiores. */
			webs: true,
			/** Bandadas de murciélagos que cruzan de vez en cuando. */
			bats: true,
			/** Calabazas talladas, con vela dentro, en las esquinas inferiores. */
			pumpkins: true,
			/** Un fantasma que sube flotando cada cierto tiempo. */
			ghosts: true,
		},
	},

	/** Diciembre / Navidad, hasta el Día de Reyes. */
	christmas: {
		enabled: true,
		season: { from: '12-01', until: '01-06' },
		options: {
			/** Copos de nieve en pantalla a la vez (0 = sin nieve). En móvil, la mitad. */
			snowflakes: 140,
			/** Guirnalda de luces de colores en el borde superior. */
			lights: true,
			/** Montón de regalos en la esquina inferior izquierda. */
			gifts: true,
			/** Arbolito con estrella y bolas en la esquina inferior derecha. */
			tree: true,
			/** El trineo de Santa cruza el cielo de vez en cuando. */
			sleigh: true,
		},
	},
} as const satisfies Record<string, SeasonalTheme>;

export type SeasonalThemeId = keyof typeof SEASONAL_THEMES;
