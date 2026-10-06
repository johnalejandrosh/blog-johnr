---
title: 'Qué es la nube, explicado sin humo'
description: 'La computadora de otro, alquilada por minutos. La definición del NIST, IaaS, PaaS y SaaS, nube pública y privada, y lo que sigue siendo tu responsabilidad.'
pubDate: '2026-09-28'
category: 'cloud'
tags: ['cloud', 'iaas', 'paas', 'fundamentos']
---

Hay una calcomanía que circula en el mundo del software desde hace años: *"There is no cloud, it's just someone else's computer"*. No existe la nube, es solo la computadora de otro. Es un chiste, pero es la mejor definición rápida que conozco. Lo que pasa es que se queda corta en lo que hace interesante a la nube, que no es dónde está la computadora sino cómo la usas.

## Antes de la nube

Imagina que en 2005 quieres lanzar una aplicación. Compras servidores, los instalas en un centro de datos o en un cuarto de la oficina con aire acondicionado, configuras la red y le instalas el sistema operativo. Eso toma semanas. Si tu aplicación se vuelve popular, compras más servidores y esperas a que lleguen. Si no se vuelve popular, ya los pagaste igual.

Tenías que adivinar cuánta capacidad ibas a necesitar, y pagar por adelantado esa adivinanza.

## La definición formal

En 2011 el NIST, el instituto de estándares de Estados Unidos, publicó una definición de computación en la nube (el documento SP 800-145) que se sigue citando hasta hoy. Me gusta porque cambia la pregunta de "dónde" a "cómo". Según el NIST, un servicio es nube si cumple cinco características:

1. Autoservicio bajo demanda. Pides un servidor desde una consola o una API y lo tienes en minutos, sin hablar con nadie.
2. Acceso amplio por red. Todo se usa a través de internet o de la red, desde cualquier dispositivo.
3. Recursos compartidos. El proveedor atiende a muchos clientes con la misma infraestructura física, y tú no sabes ni te importa en qué máquina exacta corre lo tuyo.
4. Elasticidad rápida. La capacidad crece y se encoge según la demanda, a veces de forma automática.
5. Servicio medido. Pagas por lo que usas: horas de cómputo, gigabytes guardados, peticiones atendidas.

Un servidor que alquilas por un año en un centro de datos, con contrato y todo, no es nube aunque esté lejos. Una máquina virtual que creas con un comando y apagas en una hora, sí.

## IaaS, PaaS y SaaS

La misma definición separa tres modelos de servicio. La diferencia está en cuánto administras tú y cuánto el proveedor.

| Modelo | Qué te dan | Qué administras tú | Ejemplos |
| --- | --- | --- | --- |
| IaaS (infraestructura) | Máquinas virtuales, red, discos | Sistema operativo, runtime, tu aplicación | Amazon EC2, Google Compute Engine |
| PaaS (plataforma) | Un lugar donde correr tu código | Tu aplicación y su configuración | AWS Elastic Beanstalk, Azure App Service, Google App Engine |
| SaaS (software) | La aplicación terminada | Tus datos y usuarios | Gmail, Slack, Notion |

Con IaaS tienes más control y más trabajo: si hay un parche de seguridad del sistema operativo, es tu problema. Con PaaS subes el código y el proveedor se encarga del resto, a cambio de aceptar sus reglas. Con SaaS ni siquiera ves código.

Desde que se escribió esa definición aparecieron categorías intermedias. La más conocida es serverless, o funciones como servicio: subes una función, se ejecuta cuando llega un evento y pagas por milisegundos de ejecución. Sí hay servidores, por supuesto; simplemente no son tu problema.

## Pública, privada o híbrida

El otro eje es quién usa la infraestructura:

- Nube pública: la del proveedor, compartida con otros clientes. AWS, Microsoft Azure y Google Cloud son las más grandes.
- Nube privada: infraestructura con las mismas características de autoservicio y elasticidad, pero para una sola organización. Suele verse en bancos y gobiernos con exigencias regulatorias.
- Nube híbrida: una mezcla de las dos, conectadas entre sí.

El NIST también define la nube comunitaria, compartida por organizaciones con intereses comunes, pero en la práctica la escucho mencionar poco.

## El modelo de responsabilidad compartida

Este es el concepto que más falta le hace a la gente que empieza. Que tu aplicación esté en la nube no significa que el proveedor sea responsable de su seguridad.

El proveedor responde por la seguridad *de* la nube: los edificios, el hardware, la red física, el hipervisor. Tú respondes por la seguridad *en* la nube: quién tiene acceso a tu cuenta, si dejaste un bucket de almacenamiento abierto al público, si la base de datos tiene una contraseña decente. Muchas de las filtraciones de datos que salen en las noticias no fueron un hackeo sofisticado a un proveedor. Fueron alguien que dejó algo público sin querer.

## Lo bueno y lo que cuesta

Lo que más valoro de la nube es la velocidad para probar cosas. Puedo levantar una base de datos administrada, una cola de mensajes y un par de servidores en una tarde, probar una idea y borrarlo todo. Eso antes era impensable sin presupuesto.

También cambia la forma de pagar: en lugar de comprar equipos (gasto de capital), pagas un servicio mes a mes (gasto operativo). Para una empresa que empieza, eso es enorme.

Ahora, lo que cuesta. La nube no es barata por defecto; es barata si la usas bien. Un servidor que olvidaste apagar factura igual. Las transferencias de datos hacia fuera del proveedor se cobran. Y cada servicio administrado que adoptas te ata un poco más a ese proveedor. Nada de eso es un motivo para no usarla, pero sí para revisar la factura y configurar alertas de gasto desde el día uno.

En la próxima entrada aterrizo todo esto en el proveedor más grande: [qué es AWS](/blog/que-es-aws/) y por dónde empezaría si fuera hoy.
