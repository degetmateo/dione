# 🌌 Dione - Discord Bot de Anime, Manga, Novelas Visuales y Gacha

> Un bot moderno de Discord construido con **Node.js**, **TypeScript** y **Discord.js v14**, que integra seguimiento de medios japoneses (**AniList**, **MyAnimeList**, **VNDB**), afinidad social entre usuarios y un dinámico **sistema de gacha y coleccionismo de personajes**.

---

## 📖 Tabla de Contenidos
- [Características Principales](#-características-principales)
- [Cómo Funciona](#-cómo-funciona)
  - [Ecosistema de Anime, Manga y Novelas Visuales](#1-ecosistema-de-anime-manga-y-novelas-visuales)
  - [Cálculo de Afinidad Social (Pearson)](#2-cálculo-de-afinidad-social-pearson)
  - [Juego de Gacha y Economía de Renas](#3-juego-de-gacha-y-economía-de-renas)
  - [Discord Components V2](#4-interfaz-con-discord-components-v2)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Puesta en Marcha](#-instalación-y-puesta-en-marcha)
  - [1. Clonar el repositorio e instalar dependencias](#1-clonar-el-repositorio-e-instalar-dependencias)
  - [2. Configurar variables de entorno](#2-configurar-variables-de-entorno)
  - [3. Desplegar los comandos Slash](#3-desplegar-los-comandos-slash)
  - [4. Ejecutar el bot](#4-ejecutar-el-bot)
- [Comandos Disponibles](#-comandos-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Hoja de Ruta y Refactorización](#-hoja-de-ruta-y-refactorización)
- [Licencia](#-licencia)

---

## ✨ Características Principales

* 🔍 **Consultas Multimedia Exhaustivas:** Búsqueda en tiempo real de animes y mangas en **AniList**, y novelas visuales en **VNDB**, mostrando información completa, enlaces, capturas y valoraciones de los miembros del servidor.
* 📊 **Notas Comunitarias Cruzadas:** Al buscar una obra, Dione consulta las puntuaciones de los miembros del servidor tanto en **AniList** como en **MyAnimeList**, centralizándolas en una única tarjeta visual.
* 💖 **Afinidad por Coeficiente de Pearson:** Calcula la compatibilidad exacta de gustos entre dos usuarios analizando cuantitativamente sus listas de anime y manga.
* 🃏 **Gacha de Personajes:**
  * Invocación de personajes aleatorios (`/ch`) con límite de tiradas horarias.
  * Reclamación exclusiva por servidor (`claims`).
  * Recompensa de divisas (**Renas**) al invocar personajes repetidos.
  * Intercambios mutuos (`/gacha trade`) y venta directa (`/gacha sell`).
  * Sistema de subastas en vivo con postores y aceptación de pujas (`gacha-auction`).
  * Inventario paginado de personajes coleccionados (`/gacha inventory`).
  * Lista de deseos (*wishlist*) por servidor (`💘 Lo quiero`).
* 👤 **Perfiles Personalizables:** Visualización del perfil de usuario (`/user`) con alternancia entre plataformas (AniList, MAL, VNDB) y personalización estética (color hexadecimal, avatar y banner).

---

## 🛠️ Cómo Funciona

### 1. Ecosistema de Anime, Manga y Novelas Visuales
Dione actúa como un puente entre Discord y tres de las bases de datos de cultura otaku más importantes del mundo:
* **AniList API (GraphQL):** Utilizada para búsquedas detalladas de anime y manga, obtención de perfiles de usuario y extracción de personajes para el catálogo de gacha.
* **MyAnimeList API (REST v2 + OAuth2 PKCE):** Permite vincular cuentas de MAL de forma segura mediante un flujo OAuth2 con PKCE. Cuenta con **renovación automática y transparente de tokens expirados** (`refresh_token`), evitando fallos por caducidad mensual del access token.
* **VNDB Kana API:** Conexión con la base de datos de novelas visuales para fichas informativas, votos y filtrado de capturas sin contenido explícito.

### 2. Cálculo de Afinidad Social (Pearson)
El comando `/affinity` descarga las listas completas de medios de dos usuarios desde AniList y calcula su correlación matemática:
$$\rho_{X,Y} = \frac{\operatorname{cov}(X,Y)}{\sigma_X \sigma_Y} \times 100$$
Este cálculo genera un porcentaje de afinidad realista que penaliza o premia las divergencias y coincidencias de puntuación, guardando los registros en la base de datos para rankings del servidor.

### 3. Juego de Gacha y Economía de Renas
* **Pulls y Claims:** Los usuarios disponen de un cupo de tiradas (15 pulls) y reclamos (2 claims) que se reinician automáticamente cada hora en punto mediante una tarea programada con `node-cron`.
* **Notificación de Recarga:** Dione registra el canal donde un usuario agotó sus tiradas y, al cumplirse la hora, le envía una notificación proactiva mencionándolo para avisarle que sus pulls están disponibles.
* **Economía de Renas:** La divisa del bot se obtiene al salir personajes repetidos que ya poseen dueño. Quien tira y el dueño se reparten la recompensa (o el dueño se la lleva completa si es quien tiró). Las renas pueden usarse para comprar más pulls (`/gacha buy-pulls`) o claims (`/gacha buy-claims`).

### 4. Interfaz con Discord Components V2
Dione aprovecha las últimas capacidades de la API de Discord:
* Contenedores estilizados con bordes de colores temáticos (`ContainerBuilder`).
* Secciones con miniaturas asociadas (`SectionBuilder`, `ThumbnailBuilder`).
* Bloques de texto formateados y separadores limpios (`TextDisplayBuilder`, `SeparatorBuilder`).
* Galerías multimedia nativas (`MediaGalleryBuilder`).
* Modales nativos para ingreso de tokens, pujas y datos de perfil.

---

## 📋 Requisitos Previos

* **Node.js:** Versión `24.x` o superior.
* **pnpm:** Versión `9.x` o `12.x`.
* **MongoDB:** Servidor local o instancia en la nube (MongoDB Atlas).
* **Discord Application:** Una aplicación creada en el [Discord Developer Portal](https://discord.com/developers/applications) con los intents privilegiados activados (`Guilds`, `GuildMembers`, `GuildPresences`).
* **Credenciales de APIs (Opcionales para dev, obligatorias en prod):**
  * MyAnimeList Client ID y Client Secret.
  * Token de VNDB Kana API.

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/tu-usuario/dione.git
cd dione
pnpm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto basado en el siguiente ejemplo:
```env
# Discord
TOKEN=TU_DISCORD_BOT_TOKEN
INVITE_URL=https://discord.com/oauth2/authorize?client_id=TU_CLIENT_ID&scope=bot&permissions=8
PORT=3000
DEV_ID=TU_DISCORD_USER_ID

# MongoDB
MONGODB_DATABASE_KEY=mongodb://localhost:27017
MONGODB_DATABASE_NAME=dione

# AniList
ANILIST_AUTH_URL=https://anilist.co/api/v2/oauth/authorize?client_id=TU_ANILIST_CLIENT_ID&response_type=token

# MyAnimeList
MAL_CLIENT_ID=TU_MAL_CLIENT_ID
MAL_CLIENT_TOKEN=TU_MAL_CLIENT_SECRET

# VNDB
VNDB_TOKEN=TU_VNDB_KANA_TOKEN
```

### 3. Gestión y Despliegue de Comandos Slash (`scripts/`)
Los scripts en `scripts/` permiten registrar, actualizar y eliminar comandos en Discord utilizando `CommandFactory` y `REST`:

* **Desplegar/Actualizar Todos los Comandos:**
  ```bash
  # En el servidor de pruebas (inmediato):
  pnpm run deploy-commands-guild

  # Globalmente (puede tardar hasta 1 hora en propagarse por Discord):
  pnpm run deploy-commands-global
  ```

* **Desplegar/Actualizar un Comando Individual:**
  ```bash
  # Actualizar solo el comando 'user' en el servidor de pruebas:
  pnpm run deploy-commands-guild user

  # Actualizar solo el comando 'user' globalmente:
  pnpm run deploy-commands-global user
  ```

* **Eliminar un Comando Específico:**
  ```bash
  # Ver lista de comandos registrados o eliminar por nombre/ID:
  pnpm run delete-command-guild [nombre_o_id]
  pnpm run delete-command-global [nombre_o_id]
  ```

* **Eliminar Todos los Comandos (Limpieza Total):**
  ```bash
  # Limpiar todos los comandos del servidor de pruebas:
  pnpm run delete-commands-guild

  # Limpiar todos los comandos globales:
  pnpm run delete-commands-global
  ```

### 4. Ejecutar el bot y tests

* **Modo Desarrollo (con recarga rápida vía TSX):**
  ```bash
  pnpm run dev
  ```
* **Ejecutar Suite de Pruebas Unitarias e Integración (Vitest):**
  ```bash
  pnpm run test
  ```
* **Compilación y Modo Producción:**
  ```bash
  pnpm run build
  pnpm start
  ```

---

## 🕹️ Comandos Disponibles

| Comando | Descripción |
| :--- | :--- |
| `/anime <name-or-id>` | Busca un anime en AniList con notas de los miembros del servidor. |
| `/manga <name-or-id>` | Busca un manga en AniList con notas de los miembros del servidor. |
| `/vn <name-or-id>` | Busca una novela visual en VNDB con puntuaciones y capturas. |
| `/affinity <member> [member-b]` | Calcula la afinidad de Pearson entre dos miembros del servidor. |
| `/random <type>` | Recomienda al azar un anime o manga de tu lista Plan to Watch (PTW). |
| `/user [member]` | Muestra el perfil del usuario con pestañas para AniList, MAL y VNDB. |
| `/ch` | Tira por un personaje aleatorio para reclamar, desear o cobrar renas. |
| `/character <name-or-id>` | Consulta la ficha e información de un personaje y su dueño en el servidor. |
| `/gacha buy-pulls <pulls>` | Compra tiradas adicionales por 10 renas cada una. |
| `/gacha buy-claims <claims>` | Compra reclamos adicionales por 100 renas cada uno. |
| `/gacha inventory [user]` | Muestra la lista de personajes reclamados en el servidor. |
| `/gacha trade <user> <ca> <cb>` | Intercambia un personaje propio por uno de otro usuario. |
| `/gacha sell <character> <user> <price>` | Vende un personaje a otro usuario por una cantidad de renas. |
| `/setup` | Crea o personaliza tu perfil y vincula tus cuentas externas. |
| `/unsetup` | Elimina permanentemente tu cuenta y datos de Dione. |
| `/show-scores <enabled>` | Elige si mostrar u ocultar tus notas en las búsquedas del servidor. |
| `/help` | Muestra el menú de ayuda con todos los comandos. |
| `/patch-notes` | Despliega las notas de la última versión del bot. |
| `/admin-unsetup <user>` | Desvincula a un usuario del servidor (requiere Administrador). |
| `/eval <value>` | Comandos de depuración y mantenimiento (exclusivo para el desarrollador). |

---

## 📂 Estructura del Proyecto y Arquitectura Limpia

El proyecto ha sido reorganizado siguiendo una arquitectura en capas inspirada en **Domain-Driven Design (DDD)**, **PEAA** y **GoF**, encapsulando cada componente en clases cohesivas y manteniendo un límite estricto de **~100 líneas por archivo**:

```
dione/
├── tests/                  # Suite completa de pruebas con Vitest (88 tests en 25 suites)
│   ├── core/               # Pruebas de i18n, protección anti-crash y manejo de errores
│   ├── domain/             # Pruebas de Value Objects y Servicios de Dominio
│   ├── infrastructure/     # Pruebas de repositorios MongoDB, Mongoose, APIs externas y caché
│   └── presentation/       # Pruebas de Comandos, Botones, Modales, UI Embeds y Discord Components V2
├── src/
│   ├── core/               # Núcleo de la aplicación
│   │   ├── errors/         # Jerarquía tipada de errores (AppError, ExternalApiError, etc.)
│   │   ├── i18n/           # Sistema de internacionalización dinámica (es-ES, en-US)
│   │   └── resilience/     # Blindaje anti-crash global (ProcessProtection, InteractionErrorHandler)
│   ├── domain/             # Lógica pura del dominio
│   │   ├── models/         # Modelos de dominio tipados (Anime, Manga, VN, Aniuser)
│   │   ├── value-objects/  # Objetos de valor inmutables (Renas, GachaPulls, ColorCode)
│   │   ├── services/       # Servicios de cálculo (PearsonCalculatorService, GachaRulesService)
│   │   └── repositories/   # Contratos e interfaces de repositorios
│   ├── infrastructure/     # Implementaciones técnicas y adaptadores
│   │   ├── cache/          # InteractionStateService (inmutable, con LRU eviction y consume atómico)
│   │   ├── database/       # Modelos estrictos Mongoose (User, Character, Claim, etc.)
│   │   ├── external-apis/  # Clientes HTTP y servicios especializados (AniList, MAL, VNDB, Scores)
│   │   └── repositories/   # Repositorios concretos MongoDB
│   ├── presentation/       # Capa de interacción con Discord
│   │   ├── commands/       # Slash commands en clases individuales (Command Pattern + Factory)
│   │   ├── buttons/        # 31 manejadores de botones en clases (Button Pattern + Factory)
│   │   ├── modals/         # 5 manejadores de modales en clases (Modal Pattern + Factory)
│   │   ├── discord/        # Dispatchers, Registries y Middlewares (Chain of Responsibility)
│   │   └── ui/             # EmbedFactory, ComponentFactory y Builders de Discord Components V2
│   ├── bot/                # Inicialización y ciclo de vida limpio del cliente Discord
│   └── index.ts            # Punto de entrada principal con protección de proceso
├── REQUERIMIENTOS.md       # Especificaciones exhaustivas y blueprint de arquitectura
├── package.json
└── tsconfig.json
```

---

## 🛡️ Resiliencia y Anti-Crash

* **Sin caídas por excepciones no controladas:** `ProcessProtection.initialize()` captura `uncaughtException` y `unhandledRejection` manteniendo el proceso del bot en funcionamiento continuo.
* **Transparencia para los usuarios:** `InteractionErrorHandler` detecta caídas de servicios externos (AniList, MyAnimeList, VNDB) o de la base de datos, respondiendo con mensajes amigables y efímeros sin mostrar errores crudos de JavaScript.
* **Internacionalización (i18n):** Respuestas, botones, tarjetas interactivas, embeds y avisos adaptados dinámicamente al idioma del usuario (`interaction.locale`), con soporte completo para Español e Inglés y fallback automático.
* **Cero archivos mayores a 100 líneas:** Todo el código en `src/` y `tests/` respeta el límite estricto de `<= ~100 líneas por archivo` para máxima legibilidad y mantenibilidad.
* **Suite de Pruebas Robusta:** 25 archivos de test con 88 pruebas unitarias e integración automáticas pasando al 100% mediante `vitest`.
* **Caché Concurrente y Thread-Safe:** `InteractionStateService` elimina *race conditions* en reclamos concurrentes (`consume(key)`) y libera automáticamente memoria con desalojo LRU y expiración cronometrada.

---

## 📐 Hoja de Ruta y Refactorización

Para conocer en detalle todas las especificaciones, decisiones de diseño, contratos de datos y casos de uso, consulta el archivo:

👉 **[REQUERIMIENTOS.md](./REQUERIMIENTOS.md)**

### Principios Cumplidos en el Código:
1. **Separación de Responsabilidades (SRP):** Cada clase tiene una sola razón de cambio y no excede ~100 líneas.
2. **Encapsulamiento en Clases:** Todo el código estructurado en clases TypeScript a lo Java.
3. **Patrones GoF & PEAA:** Implementación formal de *Command*, *Registry*, *Factory*, *Middleware / Chain of Responsibility*, *Repository*, *Value Object* y *Service Layer*.
4. **Alta Testabilidad:** Cobertura de tests unitarios automáticos con Vitest (`pnpm run test`).

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **ISC**.
Creado por [degetmateo](https://github.com/degetmateo).

