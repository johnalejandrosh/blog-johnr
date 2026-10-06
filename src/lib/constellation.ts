// Cada artículo sin imagen recibe su propia "constelación": unas estrellas
// colocadas con un generador sembrado por el slug, unidas por un árbol de
// expansión mínima. El mismo slug da siempre el mismo dibujo.

export type ChartStar = { x: number; y: number; r: number };

export type Constellation = {
	stars: ChartStar[];
	/** Pares de índices de `stars`. */
	lines: [number, number][];
	/** Estrellas de fondo, sin líneas. */
	field: ChartStar[];
	/** Coordenadas decorativas, en formato de carta celeste. */
	ra: string;
	dec: string;
};

const hash = (text: string) => {
	let h = 2166136261;
	for (const char of text) {
		h ^= char.charCodeAt(0);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
};

const seeded = (seed: number) => () => {
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Coordenadas normalizadas 0–1; quien dibuja decide el tamaño. */
export function constellation(slug: string): Constellation {
	const rand = seeded(hash(slug));
	const count = 6 + Math.floor(rand() * 3);

	// Las estrellas se reparten por columnas para que la figura ocupe el ancho
	// y no se amontone en una esquina.
	const stars: ChartStar[] = Array.from({ length: count }, (_, i) => ({
		x: 0.12 + ((i + 0.2 + rand() * 0.6) / count) * 0.76,
		y: 0.18 + rand() * 0.64,
		r: 1.4 + rand() ** 2 * 2.6,
	}));

	// Prim: cada estrella se une a la más cercana de las ya conectadas.
	const lines: [number, number][] = [];
	const inTree = new Set([0]);
	while (inTree.size < stars.length) {
		let best: [number, number] = [0, 0];
		let bestDist = Infinity;
		for (const a of inTree) {
			for (let b = 0; b < stars.length; b++) {
				if (inTree.has(b)) continue;
				const d = Math.hypot(stars[a].x - stars[b].x, (stars[a].y - stars[b].y) * 0.6);
				if (d < bestDist) {
					bestDist = d;
					best = [a, b];
				}
			}
		}
		lines.push(best);
		inTree.add(best[1]);
	}

	const field: ChartStar[] = Array.from({ length: 40 }, () => ({
		x: rand(),
		y: rand(),
		r: 0.3 + rand() ** 3 * 0.9,
	}));

	const raH = Math.floor(rand() * 24);
	const raM = Math.floor(rand() * 60);
	const dec = Math.round(rand() * 140 - 70);

	return {
		stars,
		lines,
		field,
		ra: `${String(raH).padStart(2, '0')}h ${String(raM).padStart(2, '0')}m`,
		dec: `${dec >= 0 ? '+' : '−'}${String(Math.abs(dec)).padStart(2, '0')}°`,
	};
}
