---
title: 'Qué es NestJS y por qué lo uso para mis APIs'
description: 'Módulos, controladores, servicios e inyección de dependencias: el framework de Node.js que le pone orden al backend, con un CRUD de ejemplo de principio a fin.'
pubDate: '2026-09-14'
category: 'backend'
tags: ['nestjs', 'node', 'typescript']
---

La primera API que hice en Node.js fue con Express, y durante un tiempo fue perfecto. Un archivo, unas rutas, listo. Después el archivo tenía 900 líneas, la lógica de negocio estaba mezclada con la validación y cada quien en el equipo organizaba las carpetas a su manera. Express no tiene la culpa: no te dice cómo estructurar nada, y esa libertad se paga cuando el proyecto crece.

NestJS es la respuesta a ese problema. Es un framework para construir aplicaciones de servidor con Node.js, escrito en TypeScript, que te da una estructura definida desde el primer día. Lo creó Kamil Myśliwiec y su primera versión salió en 2017.

## La idea en una frase

NestJS toma la arquitectura de Angular (módulos, decoradores, inyección de dependencias) y la lleva al backend. Por debajo sigue usando Express, o Fastify si se lo pides, así que no estás reinventando el servidor HTTP: estás poniéndole una arquitectura encima.

Si vienes de Spring en Java o de ASP.NET en C#, vas a sentirte en casa. Si vienes de Express puro, los decoradores te van a parecer magia durante una semana. Después ya no.

## Crear un proyecto

```bash
npm i -g @nestjs/cli
nest new mi-api
cd mi-api
npm run start:dev
```

Con eso tienes un servidor en `http://localhost:3000` que recarga solo cuando guardas. La carpeta `src` arranca con cuatro archivos:

```text
src/
├── app.controller.ts   rutas HTTP
├── app.service.ts      lógica
├── app.module.ts       el módulo raíz que lo conecta todo
└── main.ts             punto de entrada
```

Esos tres primeros nombres son los tres conceptos que tienes que entender.

## Controladores: la puerta de entrada

Un controlador recibe peticiones HTTP y devuelve respuestas. Nada más. No debería saber de bases de datos ni de reglas de negocio.

```ts
import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { TareasService } from './tareas.service';
import { CrearTareaDto } from './dto/crear-tarea.dto';

@Controller('tareas')
export class TareasController {
  constructor(private readonly tareas: TareasService) {}

  @Get()
  listar() {
    return this.tareas.listar();
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.tareas.obtener(id);
  }

  @Post()
  crear(@Body() dto: CrearTareaDto) {
    return this.tareas.crear(dto);
  }
}
```

`@Controller('tareas')` monta todo bajo `/tareas`. `@Get(':id')` define `GET /tareas/:id`. Y `ParseIntPipe` convierte el parámetro a número; si alguien manda `/tareas/abc`, Nest responde 400 sin que yo escriba una línea de validación.

## Servicios: donde vive la lógica

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CrearTareaDto } from './dto/crear-tarea.dto';

export interface Tarea {
  id: number;
  titulo: string;
  hecha: boolean;
}

@Injectable()
export class TareasService {
  private tareas: Tarea[] = [];
  private siguienteId = 1;

  listar(): Tarea[] {
    return this.tareas;
  }

  obtener(id: number): Tarea {
    const tarea = this.tareas.find((t) => t.id === id);
    if (!tarea) throw new NotFoundException(`No existe la tarea ${id}`);
    return tarea;
  }

  crear(dto: CrearTareaDto): Tarea {
    const tarea = { id: this.siguienteId++, titulo: dto.titulo, hecha: false };
    this.tareas.push(tarea);
    return tarea;
  }
}
```

Aquí guardo las tareas en un arreglo para no complicar el ejemplo; en un proyecto real este servicio hablaría con la base de datos por medio de TypeORM, Prisma o lo que uses. Lo importante es que si mañana cambio el arreglo por PostgreSQL, el controlador no se entera.

El `NotFoundException` también merece mención: lanzas la excepción y Nest la convierte en una respuesta 404 con un JSON ordenado. Se acabaron los `res.status(404).json(...)` repetidos por todo el código.

## Inyección de dependencias, sin miedo

¿Notaste que el controlador nunca hace `new TareasService()`? Solo lo pide en el constructor. Nest ve el tipo, busca quién lo provee y se lo entrega. Eso es inyección de dependencias.

Suena a concepto de libro de arquitectura, pero tiene un beneficio muy concreto: los tests. En una prueba puedo darle al controlador un servicio falso y probarlo aislado, sin levantar base de datos ni nada.

Para que esto funcione, todo se registra en un módulo:

```ts
import { Module } from '@nestjs/common';
import { TareasController } from './tareas.controller';
import { TareasService } from './tareas.service';

@Module({
  controllers: [TareasController],
  providers: [TareasService],
})
export class TareasModule {}
```

Cada funcionalidad de la aplicación (usuarios, pagos, tareas) es un módulo, y el `AppModule` los importa. Cuando abro un proyecto Nest que no conozco, sé dónde buscar las cosas. Para mí ese es el mayor argumento a favor del framework.

Y no hace falta escribir todo esto a mano. El CLI lo genera:

```bash
nest g resource tareas
```

Te pregunta qué tipo de API quieres (REST, GraphQL, microservicio) y crea el módulo, el controlador, el servicio, los DTO y hasta los tests vacíos.

## Validar lo que entra

Un DTO (Data Transfer Object) describe la forma de los datos que acepta un endpoint. Con `class-validator` le pones reglas:

```bash
npm i class-validator class-transformer
```

```ts
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearTareaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  titulo: string;
}
```

Y en `main.ts` activas la validación para toda la aplicación:

```ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
```

Con `whitelist: true`, cualquier campo que no esté en el DTO se descarta. Si alguien intenta colar un `"hecha": true` o un `"esAdmin": true` en el cuerpo de la petición, simplemente no llega al servicio.

## El recorrido de una petición

Esto me costó entenderlo y me hubiera gustado verlo dibujado al principio. Cada petición pasa por varias capas en un orden fijo:

```text
petición
  → middleware        (logs, CORS, cosas genéricas)
  → guards            (¿tiene permiso?)
  → interceptors      (antes del handler)
  → pipes             (transformar y validar)
  → controlador       (tu código)
  → interceptors      (después: dar forma a la respuesta)
  → exception filters (si algo lanzó un error)
respuesta
```

La autenticación va en un guard. La validación, en un pipe. El formato común de las respuestas, en un interceptor. Cuando cada cosa está en su lugar, el controlador queda de diez líneas.

## Lo que no me gusta

No todo es perfecto. NestJS tiene bastante ceremonia: para un endpoint sencillo creas tres o cuatro archivos. Si lo que vas a hacer es una función que responde un webhook, es demasiado. Los decoradores también esconden comportamiento, y cuando algo falla en la inyección de dependencias, los mensajes de error al principio no ayudan mucho.

Para un proyecto pequeño que vas a mantener tú solo, Express o Fastify a secas están bien. Para algo que va a crecer, o donde va a trabajar un equipo, prefiero la estructura de Nest sin dudarlo.

Nest además trae soporte propio para comunicación entre servicios por TCP, Redis, NATS, RabbitMQ, Kafka y gRPC, lo cual me lleva al tema de la próxima entrada: [qué son los microservicios](/blog/que-son-los-microservicios/) y por qué no siempre son buena idea.
