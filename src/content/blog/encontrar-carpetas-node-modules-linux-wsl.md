---
title: '¿Tu disco está lleno y no sabes por qué? Busca las carpetas node_modules'
description: 'Cómo encontré casi 20 GB escondidos en node_modules con un solo comando de find, cómo medir cuánto pesa cada carpeta en Linux o WSL y cuáles no conviene tocar.'
pubDate: '2026-10-05'
category: 'backend'
tags: ['node', 'linux', 'wsl', 'terminal']
---

Un día Windows me avisó que el disco estaba casi lleno. No había descargado nada grande, no tenía videos ni máquinas virtuales nuevas. Abrí el explorador, revisé Descargas, vacié la papelera y seguía igual. El problema estaba dentro de WSL, y tenía nombre: `node_modules`.

Cada proyecto de Node.js descarga sus dependencias en su propia carpeta `node_modules`. Un proyecto de Next.js normal ocupa entre 400 MB y 1 GB solo en eso. Yo tenía más de 30 proyectos: cursos que hice una vez, pruebas de librerías, plantillas que cloné para ver cómo estaban hechas. La mayoría no los abría desde hacía meses, pero sus dependencias seguían ahí. Cuando terminé de medir, eran 19,6 GB.

Si te pasa algo parecido, esto es lo que hice para encontrarlas todas y saber cuánto pesa cada una. Todavía no vamos a borrar nada. Primero hay que saber qué hay.

## Paso 1: listar todas las carpetas node_modules

Este comando recorre todo el sistema y te devuelve la ruta de cada `node_modules`:

```bash
find / \( -path /proc -o -path /sys -o -path /mnt -o -path /dev -o -path /run \) -prune \
  -o -type d -name node_modules -prune -print 2>/dev/null | sort
```

Se ve feo, lo sé. Vamos por partes:

- `\( -path /proc ... \) -prune` le dice a `find` que no entre en esas carpetas. `/proc`, `/sys`, `/dev` y `/run` son del sistema y ahí no hay proyectos. `/mnt` es especial en WSL: ahí están montados tus discos de Windows (`/mnt/c`, `/mnt/d`), y recorrerlos desde Linux es lentísimo. Si tus proyectos viven en el lado de Windows, quita `/mnt` de la lista y ten paciencia.
- `-name node_modules -prune -print` imprime cada `node_modules` que encuentra, pero no se mete dentro de ella. Esta es la parte que más importa. Sin el `-prune`, el comando te listaría también las cientos de `node_modules` que hay anidadas dentro de otras, y la salida sería inútil.
- `2>/dev/null` esconde los errores de "Permiso denegado" que salen al recorrer carpetas de otros usuarios o de root.

Si no quieres buscar en todo el disco, cambia `/` por `~` y solo revisa tu carpeta personal. En mi caso fue suficiente, porque todos mis proyectos estaban ahí.

## Paso 2: medir cuánto pesa cada una

Tener la lista está bien, pero lo que quieres saber es dónde está el peso. Para eso guardo las rutas en un archivo y le paso cada una a `du`:

```bash
find / \( -path /proc -o -path /sys -o -path /mnt -o -path /dev -o -path /run \) -prune \
  -o -type d -name node_modules -prune -print0 2>/dev/null > nm.list

xargs -0 -n1 du -sk < nm.list | sort -rn > sizes.txt
```

Con eso tienes `sizes.txt`, con el tamaño en KB de cada carpeta, de la más pesada a la más liviana. Para leerlo como persona y no como máquina:

```bash
# Total sumado
awk '{s+=$1} END {printf "%.2f GB\n", s/1024/1024}' sizes.txt

# Cada carpeta en MB, de mayor a menor
awk '{printf "%8.1f MB  ", $1/1024; $1=""; print substr($0,2)}' sizes.txt
```

La salida se ve así:

```text
   232.4 MB  /home/johnr/proyectos/blog/node_modules
    94.7 MB  /home/johnr/proyectos/plantillas/node_modules
    71.4 MB  /home/johnr/proyectos/app/.next/standalone/node_modules
    60.1 MB  /home/johnr/proyectos/ofertas/frontend/node_modules
```

Un detalle que me costó un rato: fíjate que uso `-print0` en `find` y `xargs -0`. Eso separa las rutas con un carácter nulo en vez de saltos de línea o espacios. Yo tenía una carpeta que se llamaba `Unit tests`, con espacio, y con el `-print` normal `du` intentaba medir `Unit` y `tests` por separado y fallaba.

## Paso 3: el espacio que de verdad vas a recuperar

Aquí me llevé una sorpresa. Sumando carpeta por carpeta me dio 21,3 GB. Pero cuando medí todo junto, el número bajó:

```bash
xargs -0 du -sck < nm.list | tail -1
```

La diferencia viene de pnpm. Si lo usas, muchos archivos de tus `node_modules` no son copias reales sino enlaces duros a un almacén central. Es el mismo archivo en disco apareciendo en varios proyectos. Cuando `du` mide cada carpeta por separado, cuenta ese archivo una vez por proyecto. Cuando las mide todas juntas, lo cuenta una sola vez.

| Medición | Mi resultado | Qué significa |
| --- | --- | --- |
| Suma carpeta por carpeta | 21,3 GB | Cuenta varias veces los enlaces duros |
| `du -sc` de todo junto | 19,6 GB | Lo máximo que podrías recuperar |

Si solo usas npm o yarn, los dos números van a salir casi iguales. Si usas pnpm, el segundo es el que vale.

## Paso 4: separar lo tuyo de lo que no lo es

Cuando miré la lista completa, no todo eran proyectos míos. Había tres tipos de carpetas mezcladas:

- Las de mis proyectos. Estas son las que me interesan y las que puedo borrar sin miedo, porque un `npm install` las vuelve a crear.
- Las que están dentro de `.next/`. Las genera Next.js al hacer build. Casi siempre pesan poco, salvo las de `.next/standalone`, que copian dependencias para desplegar.
- Las de herramientas y cachés: `~/.nvm`, `~/.npm/_npx`, `~/.cache`, `~/.local/share/pnpm`, `~/.cursor-server`, `~/.bun`. Estas no las toco a mano. Son las dependencias de Node, de tu editor o del propio pnpm, y si las borras vas a romper algo que no tiene que ver con tus proyectos.

Para ver solo las tuyas puedes filtrar las rutas que empiezan con un punto en tu home:

```bash
awk '{printf "%8.1f MB  ", $1/1024; $1=""; print substr($0,2)}' sizes.txt | grep -v '/\.'
```

No es perfecto, pero deja fuera casi todas las cachés y los `.next`.

## Una advertencia si estás en WSL

Hay algo que nadie me dijo: si borras archivos dentro de WSL, Windows no recupera ese espacio de inmediato. Linux vive dentro de un disco virtual (`ext4.vhdx`) que crece cuando lo llenas pero no se encoge solo cuando lo vacías. Para que Windows vea el espacio libre hay que compactar ese disco, y es un paso aparte.

## Lo siguiente

Con esto ya sé dónde están las carpetas y cuánto pesa cada una. Borrarlas parece fácil, un `rm -rf` y listo, pero un error en una ruta con `rm -rf` puede salir muy caro. En la próxima entrada cuento cómo las borro con una doble validación, revisando cada ruta antes de eliminar nada.
