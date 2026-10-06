---
title: 'Qué es una base de datos (y por qué casi todo termina en una)'
description: 'Tablas, SQL, transacciones, índices y cuándo tiene sentido algo distinto a una base relacional. Lo básico, con ejemplos que puedes correr hoy.'
pubDate: '2026-09-07'
category: 'bases-de-datos'
tags: ['sql', 'postgresql', 'fundamentos']
---

Si me preguntan por dónde empezar en backend, mi respuesta es siempre la misma: por la base de datos. Los frameworks cambian cada pocos años. Los datos se quedan. He visto proyectos reescribir la API completa dos veces sobre el mismo esquema de tablas, y nunca lo contrario.

Así que empiezo el blog por aquí.

## La definición corta

Una base de datos es un conjunto de datos organizado para que se pueda guardar, consultar y modificar sin perder nada por el camino. Eso es todo. Un archivo de Excel compartido por correo cumple la primera parte de la definición y falla estrepitosamente en la segunda.

Lo que de verdad usamos los desarrolladores es un **sistema gestor de bases de datos** (SGBD, o DBMS en inglés): el programa que se encarga de guardar esos datos en disco, atender a cientos de clientes a la vez, impedir que dos personas pisen el mismo registro y recuperarse si se va la luz a mitad de una escritura. PostgreSQL, MySQL, SQL Server, Oracle, SQLite y MongoDB son SGBD. Cuando alguien dice "la base de datos" casi siempre se refiere a uno de estos.

## Bases relacionales: tablas que se conocen entre sí

El modelo que domina desde hace más de cincuenta años es el relacional. Lo propuso Edgar F. Codd en 1970, en un artículo de IBM con un título nada vendedor: *A Relational Model of Data for Large Shared Data Banks*. La idea es organizar los datos en tablas (relaciones), donde cada fila es un registro y cada columna un atributo con un tipo definido.

La gracia está en que las tablas se relacionan entre sí por medio de claves. Un ejemplo que uso mucho para explicarlo:

```sql
CREATE TABLE clientes (
  id         SERIAL PRIMARY KEY,
  nombre     TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  creado_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pedidos (
  id          SERIAL PRIMARY KEY,
  cliente_id  INTEGER NOT NULL REFERENCES clientes (id),
  total       NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Fíjate en todo lo que la base de datos va a hacer cumplir por su cuenta. No puede haber dos clientes con el mismo correo. No puede existir un pedido de un cliente que no existe (`REFERENCES`). Y ningún pedido puede tener un total negativo (`CHECK`). Esas reglas viven en la base, no en el código de la API, así que da igual si el dato entra desde el backend, desde un script de migración o desde alguien que se conectó a mano un viernes por la tarde.

Esto me parece lo más subestimado de las bases relacionales. La gente las ve como un sitio donde tirar datos, cuando en realidad son la última línea de defensa de la integridad del sistema.

## SQL, el idioma para hablarles

Para consultar una base relacional se usa SQL. Nació en IBM a principios de los setenta (al principio se llamaba SEQUEL) y es de esas tecnologías que todo el mundo da por muerta cada década y que sigue ahí.

Lo bonito de SQL es que es declarativo: describes *qué* quieres, no *cómo* conseguirlo.

```sql
-- Los cinco clientes que más han comprado este año
SELECT c.nombre, SUM(p.total) AS comprado
FROM clientes c
JOIN pedidos p ON p.cliente_id = c.id
WHERE p.creado_en >= date_trunc('year', now())
GROUP BY c.nombre
ORDER BY comprado DESC
LIMIT 5;
```

En ningún lado le dije a PostgreSQL qué tabla leer primero, si usar un índice o en qué orden cruzar los datos. Eso lo decide el planificador de consultas, que suele hacerlo mejor que yo. Cuando no lo hace, existe `EXPLAIN ANALYZE` para ver qué está pensando. Aprender a leer esa salida me ha ahorrado más horas que cualquier librería.

## Transacciones y ACID

Aquí está la razón por la que los bancos no guardan saldos en archivos de texto. Una transacción agrupa varias operaciones para que se ejecuten todas o ninguna:

```sql
BEGIN;
UPDATE cuentas SET saldo = saldo - 50000 WHERE id = 1;
UPDATE cuentas SET saldo = saldo + 50000 WHERE id = 2;
COMMIT;
```

Si el servidor se cae entre los dos `UPDATE`, el dinero no desaparece: la base de datos deshace lo que alcanzó a hacer. Esa garantía se resume con la sigla ACID:

- Atomicidad: todo o nada.
- Consistencia: la transacción lleva la base de un estado válido a otro, respetando las restricciones.
- Aislamiento: dos transacciones simultáneas no ven los cambios a medio hacer de la otra (con matices según el nivel de aislamiento, que da para otro artículo).
- Durabilidad: lo que se confirmó con `COMMIT` sobrevive a un reinicio.

Mi consejo práctico: cada vez que una operación de tu API toque más de una tabla, pregúntate qué pasa si falla a la mitad. Si la respuesta te incomoda, necesitas una transacción.

## Índices: el motivo por el que tu consulta tarda 3 segundos

Sin índices, buscar un pedido por cliente obliga a la base a recorrer la tabla completa. Con diez mil filas ni lo notas. Con diez millones, sí.

```sql
CREATE INDEX idx_pedidos_cliente ON pedidos (cliente_id);
```

Un índice funciona como el índice de un libro: una estructura aparte (normalmente un árbol B) que apunta a dónde está cada valor. Acelera las lecturas y, a cambio, hace un poco más lentas las escrituras y ocupa espacio. No es gratis, así que no se trata de indexar todas las columnas "por si acaso". Indexa lo que filtras y lo que usas para cruzar tablas, y mide.

## ¿Y NoSQL?

NoSQL es un nombre paraguas para bases que no siguen el modelo relacional. No es una sola cosa:

| Tipo | Ejemplo | Para qué la he visto usar |
| --- | --- | --- |
| Documentos | MongoDB | Datos con forma variable, catálogos de productos |
| Clave-valor | Redis, DynamoDB | Caché, sesiones, contadores |
| Columnas anchas | Cassandra | Escrituras masivas, series de tiempo |
| Grafos | Neo4j | Relaciones profundas: redes, recomendaciones |

Un documento en MongoDB se ve así, más o menos:

```json
{
  "_id": "665f1c...",
  "nombre": "Ana",
  "email": "ana@correo.com",
  "pedidos": [
    { "total": 120000, "fecha": "2026-08-30" },
    { "total": 45000, "fecha": "2026-09-02" }
  ]
}
```

Los pedidos van dentro del cliente. Leer todo de un golpe es rapidísimo. El problema aparece el día que necesitas un reporte de todos los pedidos del mes, de todos los clientes, y tu modelo no estaba pensado para esa pregunta.

Mi opinión, que puede cambiar: para la gran mayoría de aplicaciones, una base relacional bien diseñada es la elección correcta por defecto. PostgreSQL en particular hoy guarda JSON, hace búsqueda de texto y, con extensiones como pgvector, hasta guarda embeddings para IA. Escogería NoSQL cuando tenga un problema concreto que lo pida, no porque suene más moderno.

## Pruébalo en cinco minutos

Si tienes Docker, levantar un PostgreSQL local es una línea:

```bash
docker run --name pg-local -e POSTGRES_PASSWORD=secreto -p 5432:5432 -d postgres:18
docker exec -it pg-local psql -U postgres
```

Pega las tablas de arriba, inserta un par de clientes y rompe cosas a propósito: intenta crear un pedido para un cliente que no existe, o dos clientes con el mismo correo. Ver a la base de datos decirte que no es la mejor forma que conozco de entender para qué sirve.

En la próxima entrada paso al otro lado del cable: [qué es NestJS](/blog/que-es-nestjs/), el framework con el que suelo construir la API que habla con esta base.
