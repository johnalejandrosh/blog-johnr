---
title: 'Qué son los microservicios (y cuándo no los usaría)'
description: 'Servicios pequeños que se despliegan por separado y tienen sus propios datos. Cómo se comunican, qué problemas traen y por qué casi siempre empiezo con un monolito.'
pubDate: '2026-09-21'
category: 'arquitectura'
tags: ['microservicios', 'arquitectura', 'mensajería']
---

Pocas palabras se han repetido tanto en entrevistas de trabajo y presentaciones de arquitectura como "microservicios". Y pocas se han aplicado tan mal. Voy a intentar explicar qué son sin el entusiasmo de conferencia, porque creo que entender sus costos es tan importante como entender sus ventajas.

## Primero, el monolito

Para entender los microservicios hay que empezar por lo que reemplazan. Un monolito es una aplicación que se construye y se despliega como una sola pieza. La tienda en línea típica tiene usuarios, catálogo, carrito, pagos y envíos dentro del mismo proyecto, comparte una base de datos y sale a producción como un solo proceso.

Eso no tiene nada de malo. Un monolito es fácil de desarrollar, fácil de probar y fácil de desplegar. Llamar a otra parte del sistema es una llamada a una función, que no falla porque se cayó la red.

Los problemas aparecen con la escala, y no me refiero solo al tráfico. Cuando hay cuarenta personas tocando el mismo repositorio, cada despliegue arrastra los cambios de todos. Un error en el módulo de reportes tumba el checkout. Y si solo el catálogo necesita más capacidad, igual tienes que escalar la aplicación entera.

## La definición

Los microservicios son un estilo de arquitectura donde la aplicación se divide en servicios pequeños e independientes. El término se popularizó alrededor de 2014, con un artículo de James Lewis y Martin Fowler que todavía vale la pena leer. Lo que identifica a un microservicio, más que su tamaño, es esto:

- Se despliega por separado. Puedo sacar una versión nueva de pagos sin tocar el catálogo.
- Es dueño de sus datos. Ningún otro servicio lee su base de datos directamente; si necesitan algo, se lo piden por su API.
- Se organiza alrededor de una capacidad del negocio (pagos, inventario, notificaciones), no alrededor de una capa técnica.
- Lo puede mantener un equipo pequeño de punta a punta.

Dibujado en texto plano, se ve así:

```text
              ┌──────────────┐
  cliente ──▶ │ API gateway  │
              └──────┬───────┘
         ┌───────────┼────────────┐
         ▼           ▼            ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │ pedidos  │ │  pagos   │ │ catálogo │
   └────┬─────┘ └────┬─────┘ └────┬─────┘
        ▼            ▼            ▼
     [ BD ]       [ BD ]       [ BD ]
```

Cada caja tiene su propio código, su propio despliegue y su propia base de datos. Esa última parte es la que más cuesta aceptar y la que más se incumple. Si tres servicios comparten la misma base, tienes un monolito distribuido: todos los problemas de un sistema distribuido y ninguna de las ventajas.

## Cómo se hablan los servicios

Hay dos grandes formas, y casi todos los sistemas reales usan ambas.

### Comunicación síncrona

Un servicio llama a otro y espera la respuesta, normalmente con HTTP/REST o gRPC. Es lo más fácil de entender, porque se parece a llamar a una función. El problema es el acoplamiento en tiempo: si pagos llama a inventario y inventario está caído, pagos también falla. Si encadenas cinco llamadas así, la disponibilidad del conjunto es peor que la de cualquiera de las piezas.

### Comunicación asíncrona

Un servicio publica un evento ("se creó el pedido 123") en un intermediario de mensajes como RabbitMQ, Kafka o Amazon SQS, y los interesados lo procesan cuando pueden. Pedidos no necesita saber quién escucha. Si notificaciones está caído, los mensajes esperan en la cola y se procesan cuando vuelva.

Con NestJS, el lado que escucha se ve más o menos así:

```ts
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class NotificacionesController {
  @EventPattern('pedido.creado')
  async alCrearPedido(@Payload() pedido: { id: number; email: string }) {
    await this.enviarCorreo(pedido.email, `Recibimos tu pedido #${pedido.id}`);
  }

  private async enviarCorreo(para: string, asunto: string) {
    // ...
  }
}
```

Lo que cambia el transporte (RabbitMQ, Kafka, Redis, NATS) es la configuración de arranque, no este código.

## Lo que nadie pone en la diapositiva

Aquí va la parte que me hubiera gustado leer antes de mi primer proyecto con microservicios.

La red falla. Una llamada entre servicios puede tardar, perderse o llegar dos veces. Necesitas timeouts, reintentos con espera creciente y operaciones idempotentes, es decir, que procesar el mismo mensaje dos veces no cobre dos veces al cliente.

Las transacciones ya no existen como las conocías. En [la entrada sobre bases de datos](/blog/que-es-una-base-de-datos/) hablé de `BEGIN` y `COMMIT`. Eso no funciona entre dos servicios con bases distintas. Si el pago se aprobó pero la reserva de inventario falló, alguien tiene que deshacer el pago. Para eso existen patrones como las sagas, y son bastante más complicados que un `ROLLBACK`.

Depurar se vuelve arqueología. Un error en producción puede haber atravesado seis servicios. Sin logs centralizados y trazas distribuidas (OpenTelemetry es el estándar hoy), encontrar dónde se rompió algo es adivinar.

Y la infraestructura crece. Cada servicio necesita su pipeline de despliegue, su monitoreo, sus secretos, su base de datos. Para un equipo de tres personas, eso es más tiempo operando que construyendo.

## La ley de Conway

En 1968 Melvin Conway escribió que las organizaciones diseñan sistemas que copian su propia estructura de comunicación. Con los microservicios se cumple al pie de la letra: funcionan bien cuando hay varios equipos independientes, cada uno dueño de una parte del negocio. Si todo el desarrollo lo hace un equipo de cinco personas, partir el sistema en doce servicios no refleja ninguna estructura real; solo agrega red entre funciones que antes se llamaban directamente.

## Cuándo sí, cuándo no

Mi regla, y la de bastante gente con más experiencia que yo, es empezar con un monolito bien organizado. Un monolito modular: separado por dominios, con límites claros entre módulos, sin que el código de pagos meta la mano en las tablas de usuarios. NestJS, con su sistema de módulos, ayuda mucho en eso.

Si un día un módulo necesita escalar distinto, cambia a un ritmo muy diferente al resto o pasa a manos de otro equipo, lo extraes como servicio. Como ya tenía sus límites definidos, la extracción es un trabajo acotado y no una reescritura.

Los microservicios resuelven problemas de organización y de escala. Si todavía no tienes esos problemas, lo más probable es que solo te traigan los de un sistema distribuido.

La siguiente pregunta lógica es dónde corre todo esto. Esa es la entrada sobre [qué es la nube](/blog/que-es-la-nube/).
