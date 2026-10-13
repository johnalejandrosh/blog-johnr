import {
	SEASONAL_OVERRIDE,
	SEASONAL_THEMES,
	SEASONAL_TIMEZONE,
	type SeasonalThemeId,
} from '../seasonal.config';

const MONTH_DAY = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/** El día de `date` en `timeZone`, como `'MM-DD'`. */
export function monthDay(date: Date, timeZone = SEASONAL_TIMEZONE): string {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone,
		month: '2-digit',
		day: '2-digit',
	}).formatToParts(date);
	const get = (type: string) => parts.find((p) => p.type === type)?.value;
	return `${get('month')}-${get('day')}`;
}

/** ¿Cae `today` dentro de [from, until]? Si `until` es menor que `from`, la
 *  temporada cruza el Año Nuevo. Con `'MM-DD'` la comparación de texto basta. */
export function inSeason(today: string, from: string, until: string): boolean {
	return from <= until ? today >= from && today <= until : today >= from || today <= until;
}

export type ActiveTheme = {
	id: SeasonalThemeId;
	/** `true` si lo eligió `SEASONAL_OVERRIDE` y no el calendario. */
	forced: boolean;
};

/** El tema que toca en `date`, o `null` si ninguno. */
export function activeSeasonalTheme(date = new Date()): ActiveTheme | null {
	// Una fecha mal escrita rompe el build, en vez de dejar el tema apagado sin avisar.
	for (const [id, theme] of Object.entries(SEASONAL_THEMES)) {
		for (const key of ['from', 'until'] as const) {
			if (!MONTH_DAY.test(theme.season[key])) {
				throw new Error(
					`seasonal.config.ts: la fecha \`${key}\` del tema "${id}" es "${theme.season[key]}"; ` +
						`tiene que ser 'MM-DD' (por ejemplo '10-01').`,
				);
			}
		}
	}

	if (SEASONAL_OVERRIDE === 'none') return null;
	if (SEASONAL_OVERRIDE) return { id: SEASONAL_OVERRIDE, forced: true };

	const today = monthDay(date);
	const ids = Object.keys(SEASONAL_THEMES) as SeasonalThemeId[];
	const id = ids.find((key) => {
		const { enabled, season } = SEASONAL_THEMES[key];
		return enabled && inSeason(today, season.from, season.until);
	});
	return id ? { id, forced: false } : null;
}
