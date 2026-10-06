---
title: 'Qué es AWS y por dónde empezaría si fuera hoy'
description: 'Regiones, zonas de disponibilidad, los servicios que de verdad vas a usar, cómo no llevarte un susto con la factura y un primer ejercicio con la CLI.'
pubDate: '2026-10-05'
category: 'cloud'
tags: ['aws', 'cloud', 's3', 'lambda']
---

La primera vez que entré a la consola de AWS cerré la pestaña a los diez minutos. Hay más de doscientos servicios, cada uno con un nombre que no explica nada (¿qué hace "Kinesis"?, ¿y "Route 53"?) y una sensación permanente de que cualquier clic te va a cobrar algo.

La segunda vez fui con un plan: entender cinco o seis servicios y no mirar el resto. Funcionó. Esta entrada es ese plan.

## Qué es AWS

Amazon Web Services es la plataforma de nube de Amazon. Es un proveedor de nube pública, en los términos que expliqué en [la entrada sobre qué es la nube](/blog/que-es-la-nube/): te alquila infraestructura y servicios por internet y te cobra por uso.

Empezó como algo interno. Amazon había construido herramientas para su propia tienda y decidió venderlas. Los primeros servicios públicos aparecieron en 2004, pero la fecha que se suele tomar como el arranque de verdad es 2006, cuando lanzaron S3 (almacenamiento) en marzo y EC2 (máquinas virtuales) en agosto. Desde entonces es el proveedor de nube más grande del mundo, por delante de Microsoft Azure y Google Cloud.

## Regiones y zonas de disponibilidad

Antes de crear cualquier cosa hay que entender dónde va a vivir.

Una región es una ubicación geográfica con varios centros de datos: `us-east-1` en el norte de Virginia, `sa-east-1` en São Paulo, `mx-central-1` en México. Tus recursos viven en la región que escojas, y los datos no salen de ahí a menos que tú los muevas.

Cada región tiene varias zonas de disponibilidad (AZ, por *availability zones*): grupos de centros de datos separados físicamente, con su propia energía y red, conectados entre sí con baja latencia. La idea es que un incendio o un corte de luz en una zona no tumbe a las demás. Si despliegas tu aplicación en dos o tres zonas, sobrevive a la caída de una.

Para escoger región me fijo en tres cosas: la cercanía a los usuarios (latencia), si están los servicios que necesito (no todos están en todas) y el precio, que cambia de una región a otra. Para aprender, `us-east-1` suele ser la más barata y la que recibe primero los servicios nuevos.

## Los servicios que de verdad vas a usar

De los cientos de servicios, estos son los que aparecen en casi cualquier proyecto que he visto:

| Servicio | Qué es | Para pensarlo así |
| --- | --- | --- |
| IAM | Usuarios, roles y permisos | Quién puede hacer qué |
| EC2 | Máquinas virtuales | Un servidor que alquilas por segundos |
| S3 | Almacenamiento de objetos | Un disco infinito para archivos |
| RDS | Bases de datos relacionales administradas | PostgreSQL o MySQL sin instalar nada |
| Lambda | Funciones serverless | Código que corre cuando pasa algo |
| DynamoDB | Base de datos NoSQL clave-valor | Lecturas rápidas a cualquier escala |
| VPC | Tu red privada dentro de AWS | Las paredes alrededor de todo lo demás |
| CloudWatch | Logs, métricas y alarmas | Ver qué está pasando |

Si entiendes esos ocho, puedes leer la arquitectura de la mayoría de aplicaciones en AWS. Lo demás lo vas aprendiendo cuando lo necesites.

## Lo primero: proteger la cuenta

Cuando creas una cuenta en AWS, el correo con el que te registraste es el usuario raíz (*root*). Ese usuario puede hacer absolutamente todo, incluido borrar la cuenta. Las dos primeras cosas que hago siempre:

1. Activar la autenticación de dos factores (MFA) en el usuario raíz.
2. Dejar de usarlo. Creo un usuario aparte para el día a día con IAM Identity Center y solo vuelvo al raíz para tareas de facturación muy puntuales.

Y la tercera, igual de importante: crear un presupuesto en AWS Budgets con una alerta por correo. Le pongo un límite bajo, unos pocos dólares, y si algo empieza a gastar me entero ese mismo día y no a fin de mes.

Sobre la capa gratuita: AWS la cambió a mediados de 2025. Las cuentas nuevas ahora reciben créditos (hasta 200 dólares) y un plan gratuito por tiempo limitado, en lugar del esquema anterior de doce meses gratis en ciertos servicios. Las condiciones cambian, así que antes de crear la cuenta revisa la página oficial de la capa gratuita.

## Un primer ejercicio con la CLI

La consola web está bien para mirar, pero yo trabajo casi todo desde la terminal. Con la AWS CLI instalada y configurada (`aws configure sso` si usas Identity Center), subir un archivo a S3 se ve así:

```bash
# Crear un bucket. El nombre es único en todo AWS, no solo en tu cuenta.
aws s3 mb s3://johnr-pruebas-2026 --region us-east-1

# Subir un archivo
aws s3 cp notas.txt s3://johnr-pruebas-2026/

# Listar lo que hay
aws s3 ls s3://johnr-pruebas-2026/

# Borrar todo cuando termines
aws s3 rb s3://johnr-pruebas-2026 --force
```

Ese último comando es tan importante como los otros. Acostúmbrate a borrar lo que creas para practicar.

## Y una función Lambda

Lambda es el servicio con el que más me divertí al principio, porque te deja tener algo en internet sin pensar en servidores. Esto es una función completa en Node.js:

```js
export const handler = async (event) => {
  const nombre = event.queryStringParameters?.nombre ?? 'mundo';

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ saludo: `hola, ${nombre}` }),
  };
};
```

La creas desde la consola, le activas una *function URL* y tienes un endpoint público que responde JSON. Pagas por cada invocación y por el tiempo que tarda en ejecutarse, medido en milisegundos. Para un proyecto personal con poco tráfico, la factura suele ser de centavos.

Lambda tiene sus límites, claro. Una ejecución dura como máximo 15 minutos, la primera invocación después de un rato sin uso tarda más (el famoso *cold start*) y depurar es menos cómodo que en tu máquina. Para una API con tráfico constante, muchas veces sale mejor un contenedor.

## Lo que le diría a alguien que empieza

No intentes aprender AWS entero. Nadie lo sabe entero. Escoge un proyecto pequeño y real, como subir una página estática a S3 o hacer una API con Lambda y DynamoDB, y aprende los servicios que ese proyecto te pide.

Cuando ya te sientas cómodo creando cosas a mano, el siguiente paso es dejar de hacerlo a mano: describir la infraestructura en código con AWS CDK o Terraform. Eso merece su propia entrada, y probablemente la escriba pronto.

Con esta entrada cierro la primera serie del blog: [bases de datos](/blog/que-es-una-base-de-datos/), [NestJS](/blog/que-es-nestjs/), [microservicios](/blog/que-son-los-microservicios/), [la nube](/blog/que-es-la-nube/) y AWS. Son las cinco piezas con las que construyo casi todo lo que hago en el trabajo.
