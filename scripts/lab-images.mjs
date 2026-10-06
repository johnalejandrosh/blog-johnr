// Descarga a public/lab/ las imágenes que arranca la máquina de /lab (BIOS y
// kernel Linux) y comprueba su sha256. Se sirven desde el propio sitio porque
// i.copy.sh responde 403 a las peticiones con Referer de otro dominio, es
// decir, a cualquier navegador que venga de aquí.
//
// Corre antes de `build` y `dev`; si los archivos ya están y cuadran, no hace
// nada. Los .bin no van al repositorio (ver .gitignore).
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../public/lab/', import.meta.url);
const BIOS = 'https://raw.githubusercontent.com/copy/v86/6db8b157974dbaf1b54d2c2ec12dd71ddc1891e9/bios';

const IMAGES = [
	{
		name: 'seabios.bin',
		url: `${BIOS}/seabios.bin`,
		sha256: '73e3f359102e3a9982c35fce98eb7cd08f18303ac7f1ba6ebfbe6cdc1c244d98',
	},
	{
		name: 'vgabios.bin',
		url: `${BIOS}/vgabios.bin`,
		sha256: 'a4bc0d80cc3ca028c73dafa8fee396b8d054ce87ebd8abfbd31b06b437607880',
	},
	{
		name: 'buildroot-bzimage68.bin',
		url: 'https://i.copy.sh/buildroot-bzimage68.bin',
		sha256: '507a759c70ab7a490a233be454d0b5b88bc667956a410b531cb4edc091e2eb1c',
	},
];

const sha256 = (data) => createHash('sha256').update(data).digest('hex');

await mkdir(OUT, { recursive: true });

for (const image of IMAGES) {
	const file = new URL(image.name, OUT);

	try {
		if (sha256(await readFile(file)) === image.sha256) continue;
	} catch {
		// No existe todavía: se descarga.
	}

	process.stdout.write(`lab: descargando ${image.name}… `);
	const response = await fetch(image.url);
	if (!response.ok) throw new Error(`${image.url} respondió ${response.status}`);

	const data = Buffer.from(await response.arrayBuffer());
	const hash = sha256(data);
	if (hash !== image.sha256) throw new Error(`${image.name}: sha256 ${hash}, se esperaba ${image.sha256}`);

	await writeFile(file, data);
	console.log(`${(data.length / 1024 / 1024).toFixed(1)} MB`);
}
