# Dione - Documento Integral de Especificaciones, Requerimientos y Arquitectura

---

## 1. Introducción y Visión General

**Dione** es un bot de Discord multipropósito enfocado en el ecosistema de **Anime, Manga, Novelas Visuales (VN)** y un completo **Sistema de Gacha/Coleccionismo de Personajes** con economía propia.

Está desarrollado en **Node.js** con **TypeScript**, integrando la librería `discord.js` (v14) con características modernas como **Discord Components V2** (contenedores estilizados, galerías de medios, textos enriquecidos y botones nativos), consumo de APIs externas (GraphQL y REST) y persistencia en base de datos NoSQL (**MongoDB**).

### Objetivos Clave del Bot
1. **Consultas de Entretenimiento:** Búsqueda rápida y detallada de anime, manga y novelas visuales con visualización de puntuaciones de los miembros del servidor.
2. **Perfiles y Sincronización:** Vinculación OAuth2/Token con plataformas externas (**AniList**, **MyAnimeList**, **VNDB**).
3. **Afinidad Social:** Cálculo matemático de afinidad entre usuarios utilizando el coeficiente de correlación de Pearson sobre sus listas y puntuaciones.
4. **Juego de Gacha:** Mecánica de invocación de personajes (pulls), reclamación (claims), lista de deseos (favourites), recompensas de divisas (*renas*), intercambios (trades), compraventa directa y subastas con pujas en tiempo real.

---

## 2. Stack Tecnológico y Dependencias

### 2.1 Core Runtime & Lenguaje
* **Node.js:** Versión mínima recomendada `24.x` (probado con `24.22.1`).
* **TypeScript:** `^7.0.2` (compilación estricta `ES2022` / `nodenext`).
* **Gestor de Paquetes:** `pnpm` (workspace habilitado).
* **Ejecutor en Desarrollo:** `tsx` (`^4.23.0`) con soporte nativo de `--env-file=.env`.

### 2.2 Librerías de Producción
* `discord.js (^14.27.0)`: Framework principal para interactuar con la API Gateway y REST de Discord.
* `mongodb (^7.5.0)`: Driver oficial de base de datos MongoDB.
* `node-cron (^4.6.0)`: Planificador de tareas programadas (reseteo horario de pulls y claims).
* `uuid (^14.0.1)`: Generación de identificadores únicos universales (v7 / v4).
* `colornames (^1.1.1)` / `@types/colornames`: Mapeo de nombres de colores a valores hexadecimales.
* `iso-639-1 (^3.1.5)`: Utilidad de códigos de idiomas ISO 639-1.

### 2.3 Variables de Entorno (`.env`)
| Variable | Descripción | Ejemplo / Uso |
| :--- | :--- | :--- |
| `TOKEN` | Token secreto del bot de Discord | `MTA...` |
| `PORT` | Puerto auxiliar de ejecución | `3000` |
| `INVITE_URL` | Enlace de invitación OAuth2 del bot | `https://discord.com/oauth2/...` |
| `MONGODB_DATABASE_KEY` | URI de conexión a MongoDB | `mongodb+srv://...` o `mongodb://localhost:27017` |
| `MONGODB_DATABASE_NAME` | Nombre de la base de datos | `dione` |
| `ANILIST_AUTH_URL` | URL de autorización OAuth2 de AniList | `https://anilist.co/api/v2/oauth/authorize?...` |
| `MAL_CLIENT_ID` | Client ID de la app MyAnimeList | `e3b...` |
| `MAL_CLIENT_TOKEN` | Client Secret de MyAnimeList | Secreto OAuth de MAL |
| `VNDB_TOKEN` | Token maestro de acceso a la API de VNDB | Token Kana API |
| `DEV_ID` | Discord ID del desarrollador principal | `523216917620850719` |

---

## 3. Arquitectura Actual del Sistema

```
                      +---------------------------------------+
                      |               DISCORD                 |
                      +---------------------------------------+
                                          |
                              WebSocket / Gateway Events
                                          v
+---------------------------------------------------------------------------------+
|                                 CLIENT (Bot)                                    |
|                                                                                 |
|  +--------------------+   +---------------------+   +------------------------+  |
|  |   Events Handler   |   |  Commands Handler   |   | Buttons/Modals Handler |  |
|  +--------------------+   +---------------------+   +------------------------+  |
|            |                         |                           |              |
|            v                         v                           v              |
|     +-------------+        +-------------------+        +-----------------+     |
|     | Events Exec |        | Slash Command Map |        | Component Map   |     |
|     +-------------+        +-------------------+        +-----------------+     |
|                                      |                           |              |
|                             +--------+---------------------------+              |
|                             | Memory Cache & State Store                        |
|                             +------------------------------------+              |
+---------------------------------------------------------------------------------+
                                       |
        +------------------------------+------------------------------+
        |                              |                              |
        v                              v                              v
+----------------+            +------------------+           +-------------------+
|  Repositories  |            |   External APIs  |           |     Schedulers    |
|   (MongoDB)    |            | AniList, MAL,    |           |   (node-cron)     |
|                |            | VNDB             |           |                   |
+----------------+            +------------------+           +-------------------+
```

### 3.1 Ciclo de Inicialización (`src/index.ts`)
1. Carga de variables de entorno (`--env-file=.env`).
2. Conexión a MongoDB mediante `mongo.init()`.
3. Ejecución de migraciones automáticas (`migration.execute()`).
4. Creación de la instancia `Bot` (`extends Client<true>`), registro dinámico de eventos, comandos, botones y modales.
5. Carga en memoria (`memoryModule.characters`) de todos los personajes almacenados en la base de datos para acelerar sorteos en `/ch`.
6. Conexión del cliente a Discord (`bot.login(TOKEN)`).
7. Inicialización del cron job horario de recarga de pulls y claims (`GachaSchedulerModule.SCHEDULE_PULLS_RESET`).

---

## 4. Especificación Detallada de Eventos de Discord

El bot escucha los siguientes eventos del Gateway de Discord:

### 4.1 `ready` (`Events.ClientReady`)
* **Archivo:** `src/events/ready.event.ts`
* **Trigger:** Una vez que el bot establece sesión con Discord.
* **Comportamiento:**
  * Registra en consola el tag del bot autenticado.
  * Inicia un temporizador recurrente de 60 segundos que rota la presencia/actividad del bot entre:
    1. *Listening* `/help`
    2. *Watching* `{client.guilds.cache.size} servidores!`

### 4.2 `interactionCreate` (`Events.InteractionCreate`)
* **Archivo:** `src/events/interaction-create.event.ts`
* **Trigger:** Cualquier interacción enviada por un usuario (Slash Command, Button, Modal Submit).
* **Flujo de Ejecución:**
  1. Filtra interacciones que no ocurran dentro de un servidor (`interaction.inGuild()`).
  2. Si es `ChatInputCommand`:
     * Busca el comando en la colección `bot.commands`.
     * Comprueba si el bot está en modo **Mantenimiento** (`bot.settings.maintenance`). Si lo está, deniega la ejecución salvo para el comando `/eval`.
     * Ejecuta `cooldownsHelper.execute(interaction)`. Si el usuario tiene cooldown activo, lanza un `GenericError` internacionalizado.
     * Ejecuta el comando.
  3. Si es `Button` o `ModalSubmit`:
     * Verifica mantenimiento.
     * Desglosa `interaction.customId` usando el delimitador `_`:
       * `args[0]` = Identificador del componente registrado (`componentId`).
       * `args[1]` = Clave de caché en memoria (`cacheId`).
       * `args[2+]` = Argumentos complementarios (por ejemplo, IDs de usuario o personaje).
     * Recupera el estado guardado en caché: `bot.get(cacheId)`.
     * Invoca el handler correspondiente pasándole `interaction` y `data`.
  4. Manejo Global de Errores:
     * Si ocurre un `GenericError`, responde efímeramente con `ErrorEmbed(error.message)`.
     * Para cualquier otra excepción no controlada, registra el error y responde con mensaje genérico de fallo.

### 4.3 `guildCreate` (`Events.GuildCreate`)
* **Archivo:** `src/events/guild-create.event.ts`
* **Trigger:** Cuando el bot es añadido a un nuevo servidor de Discord.
* **Comportamiento:**
  * Inserta un nuevo documento en la colección `guilds` con `_id: guild.id` y lista de afinidades vacía (`affinities: []`).

### 4.4 `guildMemberRemove` (`Events.GuildMemberRemove`)
* **Archivo:** `src/events/guild-member-remove.event.ts`
* **Trigger:** Cuando un usuario abandona o es expulsado/baneado de un servidor.
* **Comportamiento:**
  * Elimina todos los personajes reclamados por el usuario en dicho servidor: `mongo.claims.deleteMany({ guild_id, user_id })`.
  * Elimina la membresía del servidor: `mongo.memberships.deleteOne({ _id: `${guild_id}_${user_id}` })`.

---

## 5. Catálogo Exhaustivo de Comandos Slash

### 5.1 Categoría General: Anime, Manga y Novelas Visuales

#### 1. `/anime`
* **Descripción:** Búsqueda de una serie de anime en AniList por Nombre o por ID numérico.
* **Opciones:**
  * `name-or-id` (String, Requerido): Nombre o ID del anime.
* **Comportamiento:**
  * Si es numérico: consulta directa por ID (`anilist.search.anime.id`). Devuelve la ficha (`AnimeEmbed`) y, si los miembros del servidor tienen vinculada su cuenta y activada la opción de mostrar notas (`show-scores: true`), añade el `ScoresEmbed` con las notas del servidor.
  * Si es texto: búsqueda por nombre (`anilist.search.anime.name`). Genera una lista paginada en caché (`180s`) con botones de navegación `←` y `→`.

#### 2. `/manga`
* **Descripción:** Búsqueda de un manga en AniList por Nombre o por ID numérico.
* **Opciones:**
  * `name-or-id` (String, Requerido): Nombre o ID del manga.
* **Comportamiento:**
  * Análogo a `/anime`, buscando en la base de datos de AniList con soporte de puntuaciones de servidor y paginación interactiva.

#### 3. `/vn`
* **Descripción:** Búsqueda de Novelas Visuales en VNDB.
* **Opciones:**
  * `name-or-id` (String, Requerido): Nombre o ID de la novela visual.
* **Comportamiento:**
  * Consulta a VNDB Kana API (`vndb.vn(args)`).
  * Renderiza `VNEmbed` con descripción, estado, desarrolladores y capturas de pantalla filtradas (excluyendo contenido explícito/sexual).
  * Consulta puntuaciones personales de hasta 5 miembros del servidor que tengan configurado su token de VNDB y muestra `VNScoresEmbed`.
  * Si hay más de un resultado, genera botones interactivos de paginación (`vn-button-back` / `vn-button-next`).

#### 4. `/affinity`
* **Descripción:** Calcula el coeficiente de afinidad entre dos miembros del servidor en base a sus listas de AniList.
* **Opciones:**
  * `member` (User, Requerido): Primer usuario.
  * `member-b` (User, Opcional): Segundo usuario (por defecto: el usuario que invoca el comando).
* **Validaciones:**
  * No se permite calcular afinidad contra uno mismo.
  * Ambos usuarios deben estar registrados en el bot y tener vinculada su cuenta de AniList.
* **Lógica:**
  * Descarga las listas completas de anime y manga de ambos usuarios mediante GraphQL (`anilist.search.entries`).
  * Realiza el cruce de medias comunes y aplica la fórmula de correlación de Pearson:
    $$r = \frac{\sum (A_i - \bar{A})(B_i - \bar{B})}{\sqrt{\sum (A_i - \bar{A})^2 \sum (B_i - \bar{B})^2}} \times 100$$
  * Persiste o actualiza el registro en el ranking de afinidades del servidor (`guildsRepository.update.affinityTop`).
  * Devuelve `AffinityEmbed` con el porcentaje de compatibilidad.

#### 5. `/random`
* **Descripción:** Selecciona aleatoriamente un anime o manga de la lista "Plan to Watch" (PTW / Planning) de AniList del usuario.
* **Opciones:**
  * `type` (String, Requerido): Elección entre `ANIME` o `MANGA`.
* **Validaciones:** Requiere tener perfil registrado con AniList vinculado y al menos 1 elemento en la lista de pendientes.

#### 6. `/user`
* **Descripción:** Muestra el perfil completo de un usuario con botones de alternancia entre plataformas.
* **Opciones:**
  * `member` (User, Opcional): Usuario a consultar (por defecto: el invocador).
* **Comportamiento:**
  * Recupera datos del usuario de MongoDB.
  * Muestra inicialmente `UserProfileEmbed` (antigüedad, renas, personajes reclamados, pulls y claims restantes, banner y avatar personalizados).
  * Despliega botones dinámicos (`UserRowComponent`) según las plataformas vinculadas:
    * `Ver ANILIST` (`user-anilist-button`): estadísticas globales, géneros más vistos y scores bayesianos.
    * `Ver MAL` (`user-mal-button`): estadísticas de anime de MyAnimeList.
    * `Ver VNDB` (`user-vndb-button`): resumen de novelas visuales votadas.
    * `Ver PERFIL` (`user-default-button`): retorno a la vista principal.

---

### 5.2 Categoría Perfil y Configuración

#### 7. `/setup`
* **Descripción:** Permite registrar un perfil en Dione o gestionar personalizaciones y vinculaciones de cuentas.
* **Comportamiento:**
  * Respuesta efímera con botones interactivos:
    * `Customizar` (`setup-profile-button`): Abre modal para configurar color hexadecimal, URL de avatar y URL de banner.
    * `ANILIST` (`setup-anilist-button`): Envía enlace de autenticación y botón para ingresar token vía modal.
    * `MyAnimeList` (`setup-mal-button`): Inicia flujo OAuth2 con PKCE (genera `code_verifier`, enlace de autorización y modal para introducir `code_state`).
    * `VNDB` (`setup-vndb-button`): Envía instrucciones para generar un token en VNDB e ingresarlo vía modal.

#### 8. `/unsetup`
* **Descripción:** Permite a un usuario eliminar de forma irrevocable todos sus datos de Dione.
* **Comportamiento:** Presenta confirmación efímera de peligro con botón `unsetup-button` que purga al usuario de `users` y `memberships`.

#### 9. `/show-scores`
* **Descripción:** Activa o desactiva la visibilidad de las notas del usuario en las búsquedas de `/anime`, `/manga` y `/vn` en el servidor actual.
* **Opciones:**
  * `enabled` (Boolean, Requerido): `true` para mostrar notas, `false` para ocultarlas.
* **Persistencia:** Modifica el campo `show_scores` en la colección `memberships`.

---

### 5.3 Categoría Gacha y Coleccionismo

#### 10. `/ch`
* **Descripción:** Tira por un personaje aleatorio de anime/manga para reclamar.
* **Consumo:** Requiere tener al menos `1 pull` disponible. Decrementa las pulls en 1 y guarda el canal actual (`gacha.last_channel_id`) para notificar al recargar.
* **Mecánica:**
  * Obtiene un personaje al azar del array en memoria (`memoryModule.characters`).
  * Si el personaje no ha sido actualizado en más de un mes, invoca en segundo plano `updateCharacterHelper` para refrescar sus datos desde AniList.
  * Verifica si el personaje ya está reclamado en el servidor (`claims`).
  * Presenta una **CharacterClaimCardComponent** (Components V2):
    * Nombre, obra a la que pertenece, imagen oficial, recuento de favoritos, veces reclamado y lista de usuarios del servidor que lo tienen en lista de deseos (`favourites`).
    * **Botones:**
      * Si NO tiene dueño: botón `✋ Reclamar` (`claim-button`). Requiere claims > 0.
      * Si YA tiene dueño: botón `💰 Recompensa` (`renas-button`). Otorga divisas *renas* (repartidas equitativamente entre el dueño y quien tiró el comando, o íntegras si el dueño lo vuelve a sacar).
      * Botón universal: `💘 Lo quiero` (`fav-button`). Agrega o quita al personaje de la lista de deseos del usuario en ese servidor.

#### 11. `/gacha buy-pulls`
* **Descripción:** Compra tiradas adicionales utilizando renas.
* **Tasa de Cambio:** `1 pull = 10 renas`.
* **Opciones:** `pulls` (Number, Requerido, Mínimo 1).

#### 12. `/gacha buy-claims`
* **Descripción:** Compra reclamos adicionales utilizando renas.
* **Tasa de Cambio:** `1 claim = 100 renas`.
* **Opciones:** `claims` (Number, Requerido, Mínimo 1).

#### 13. `/gacha inventory`
* **Descripción:** Consulta la lista de personajes reclamados en el servidor actual, ordenados por número de favoritos.
* **Opciones:** `user` (User, Opcional, por defecto el usuario actual).
* **Paginación:** Agrupa de a 20 personajes por página con botones de navegación `Anterior` y `Siguiente`.

#### 14. `/gacha trade`
* **Descripción:** Intercambio directo y simultáneo de un personaje entre dos usuarios del mismo servidor.
* **Opciones:**
  * `user` (User, Requerido): Usuario receptor del intercambio.
  * `ca_name-or-id` (String, Requerido): Nombre o ID del personaje ofrecido por el usuario invocador.
  * `cb_name-or-id` (String, Requerido): Nombre o ID del personaje solicitado al receptor.
* **Flujo:** Valida la posesión de ambos personajes en el servidor. Envía tarjeta de confirmación con botón `gacha-trade-confirm-button`, y luego tarjeta de aceptación para el receptor (`gacha-trade-accept-button`). Al completarse, transfiere la titularidad en la colección `claims`.

#### 15. `/gacha sell`
* **Descripción:** Ofrece vender un personaje propio a otro usuario por una cantidad fija de renas.
* **Opciones:**
  * `name-or-id` (String, Requerido): Personaje a vender.
  * `user` (User, Requerido): Comprador propuesto.
  * `price` (Number, Requerido, Mínimo 0): Precio en renas.
* **Flujo:** Envía tarjeta con botón `gacha-sell-confirm-button`, luego notifica al comprador con botón `gacha-sell-buy-button`. Al aceptar, descuenta las renas al comprador, las acredita al vendedor y traspasa el `claim`.

#### 16. `/character`
* **Descripción:** Búsqueda informativa de personajes en AniList (por ID o nombre) mostrando dueño en el servidor y botón para añadir a lista de deseos.

---

### 5.4 Categoría Administrativa y Desarrollo

#### 17. `/admin-unsetup`
* **Permiso requerido:** `Administrator`.
* **Descripción:** Desvincula a un usuario del servidor eliminando su registro de membresía.
* **Opciones:** `user` (User, Opcional) o `user-id` (String, Opcional). Al menos uno es obligatorio.

#### 18. `/eval` (Solo Desarrollador)
* **Permiso:** Comprobación estricta de `interaction.user.id === process.env.DEV_ID`.
* **Subcomandos internos por prefijo en opción `value`:**
  * `ccc <segundos>`: Modifica el cooldown de reclamar personaje (`character_claim_cooldown`).
  * `renas <cantidad>`: Modifica la cantidad de renas por reclamo repetido (`renas_per_reclaim`).
  * `maintenance <1|0>`: Activa o desactiva el modo mantenimiento global.

#### 19. `/help`
* **Descripción:** Envía un embed con el resumen de comandos y funcionalidades de Dione.

#### 20. `/patch-notes`
* **Descripción:** Envía una tarjeta con los cambios recientes de versiones del bot.

---

## 6. Catálogo de Componentes Interactivos (Botones y Modales)

| Identificador (`customId`) | Tipo | Parámetros en CustomId | Función / Efecto |
| :--- | :--- | :--- | :--- |
| `claim-button` | Botón | `claim-button_<key>` | Reclama el personaje sorteado en `/ch`. Descuenta 1 claim. |
| `renas-button` | Botón | `renas-button_<key>` | Otorga renas por personaje repetido al dueño y/o tirador. |
| `fav-button` | Botón | `fav-button_<key>_<characterId>` | Añade o remueve el personaje de la wishlist del servidor. |
| `media-back-button` / `media-next-button` | Botones | `media-[back\|next]-button_<key>` | Navegación entre resultados de anime/manga. |
| `vn-button-back` / `vn-button-next` | Botones | `vn-button-[back\|next]_<key>` | Navegación entre novelas visuales de VNDB. |
| `setup-profile-button` | Botón | `setup-profile-button_<key>` | Despliega modal de personalización de perfil. |
| `setup-profile-modal` | Modal | `setup-profile-modal_<key>` | Guarda color, avatar URL y banner URL en MongoDB. |
| `setup-anilist-button` | Botón | `setup-anilist-button_<key>` | Muestra enlace OAuth y botón para modal de token. |
| `setup-instructions-anilist-button` | Botón | `setup-instructions-anilist-button_<key>` | Abre modal para pegar token de AniList. |
| `setup-instructions-anilist-modal` | Modal | `setup-instructions-anilist-modal_<key>` | Valida token con AniList Viewer y guarda en `users`. |
| `setup-mal-button` | Botón | `setup-mal-button_<key>` | Genera URL PKCE de MyAnimeList y botón de código. |
| `setup-instructions-mal-button` | Botón | `setup-instructions-mal-button_<key>` | Abre modal para pegar el código `code_state` de MAL. |
| `setup-instructions-mal-modal` | Modal | `setup-instructions-mal-modal_<key>` | Intercambia código por tokens OAuth de MAL y guarda en BD. |
| `setup-vndb-button` | Botón | `setup-vndb-button_<key>` | Muestra instrucciones y botón de modal de token VNDB. |
| `setup-instructions-vndb-modal` | Modal | `setup-instructions-vndb-modal_<key>` | Valida token con API Kana de VNDB y guarda en BD. |
| `unsetup-button` | Botón | `unsetup-button_<key>` | Confirma y ejecuta el borrado de perfil del usuario. |
| `user-anilist-button` / `user-mal-button` / `user-vndb-button` / `user-default-button` | Botones | `user-[platform]-button_<key>` | Cambia la pestaña del embed en `/user`. |
| `gacha-trade-confirm-button` | Botón | `gacha-trade-confirm-button_<key>` | Inicia solicitud de intercambio para el segundo usuario. |
| `gacha-trade-accept-button` | Botón | `gacha-trade-accept-button_<key>` | Ejecuta el swap de titularidad de los dos personajes. |
| `gacha-sell-confirm-button` | Botón | `gacha-sell-confirm-button_<key>` | Envía la oferta de venta formal al comprador. |
| `gacha-sell-buy-button` | Botón | `gacha-sell-buy-button_<key>` | Efectúa la transferencia de renas y personaje. |
| `gacha-auction-start-button` | Botón | `gacha-auction-start-button_<key>` | Inicia una subasta abierta para el personaje. |
| `gacha-auction-push-button` | Botón | `gacha-auction-push-button_<key>` | Despliega modal para que un postor envíe su puja. |
| `gacha-auction-push-modal` | Modal | `gacha-auction-push-modal_<key>` | Valida monto de puja y notifica al anfitrión. |
| `gacha-auction-accept-push-button` | Botón | `gacha-auction-accept-push-button_<key>_<userId>` | El anfitrión acepta la puja ganadora. |

---

## 7. Modelo de Datos y Esquemas de Persistencia

### 7.1 Colección `users`
Representa la cuenta global de un usuario de Discord en Dione:
```typescript
interface UserDocument {
  _id: string; // Discord User ID
  created_at: Date;
  renas: number; // Moneda de economía interna
  exchanges: {
    completed_count: number;
    active: any | null;
    history: any[];
  };
  anilist: {
    id: number | string;
    token: string;
  } | null;
  mal: {
    id: number;
    name: string;
    joined_at: Date;
    auth: {
      token_type: string;
      expires_in: number;
      access_token: string;
      refresh_token: string;
    };
  } | null;
  vndb: {
    id: string;
    username: string;
    auth: {
      token: string;
      permissions: string[];
    };
  } | null;
  profile: {
    color: string | null; // Color hexadecimal
    preferred_platform: 'anilist' | 'mal' | 'vndb' | null;
    avatar_url: string | null;
    banner_url: string | null;
  };
  gacha: {
    pulls: number; // Por defecto: 15
    claims: number; // Por defecto: 2
    last_channel_id: string | null; // Canal donde se quedó sin tiradas
  };
  claimed_characters_count?: number;
}
```

### 7.2 Colección `guilds`
Almacena configuración y estadísticas por servidor:
```typescript
interface GuildDocument {
  _id: string; // Discord Guild ID
  affinities: Array<{
    pearson: number;
    pair: {
      a: { discord_id: string };
      b: { discord_id: string };
    };
  }>;
}
```

### 7.3 Colección `memberships`
Relación N:M entre usuarios y servidores:
```typescript
interface MembershipDocument {
  _id: string; // Formato: `${guild_id}_${user_id}`
  guild_id: string;
  user_id: string;
  show_scores: boolean; // Si el usuario desea mostrar sus notas en el servidor
}
```

### 7.4 Colección `characters`
Catálogo de personajes scrapeados de AniList:
```typescript
interface CharacterDocument {
  _id: number; // AniList Character ID
  url: string;
  gender: string | null;
  age: string | null;
  favourites: number;
  name: string;
  images: Array<{ url: string }>;
  media?: Array<{
    id: number;
    title: { userPreferred: string };
    siteUrl: string;
    favourites: number;
  }>;
  claimed_count: number;
  updated_at: Date;
}
```

### 7.5 Colección `claims`
Titularidad de un personaje dentro de un servidor específico:
```typescript
interface ClaimDocument {
  _id: string; // Formato: `${guild_id}_${character_id}`
  guild_id: string;
  character_id: number;
  user_id: string; // Dueño actual en el servidor
}
```

### 7.6 Colección `favourites`
Lista de deseos (wishlist) de personajes por servidor:
```typescript
interface FavouriteDocument {
  _id: string; // Formato: `${guild_id}_${character_id}_${user_id}`
  guild_id: string;
  character_id: number;
  user_id: string;
}
```

---

## 8. Integración con APIs Externas

```
+-----------------------------------------------------------------------------------------+
|                                    APIs EXTERNAS                                        |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  1. AniList (GraphQL)                                                                   |
|     - Endpoint: https://graphql.anilist.co                                              |
|     - Queries: Búsqueda anime/manga, personajes por ID/nombre, viewer info, scores.     |
|     - Autenticación: Cabecera Bearer Token (token personal del usuario).                |
|                                                                                         |
|  2. MyAnimeList (REST v2 + OAuth2 con PKCE)                                             |
|     - Endpoints: https://myanimelist.net/v1/oauth2/authorize                            |
|                  https://myanimelist.net/v1/oauth2/token                                |
|                  https://api.myanimelist.net/v2/users/@me                               |
|     - Flujo: Generación de code_verifier (criptográfico), bridge web en docs/index.html |
|              y canje por access_token y refresh_token.                                  |
|                                                                                         |
|  3. VNDB (Visual Novel Database - Kana API)                                             |
|     - Endpoints: https://api.vndb.org/kana/authinfo                                     |
|                  https://api.vndb.org/kana/vn                                           |
|                  https://api.vndb.org/kana/ulist                                        |
|     - Autenticación: Cabecera `Authorization: token <token>`.                            |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

---

## 9. Sistema de Economía y Mecánicas de Gacha

1. **Recarga Horaria:** Cada hora en punto (`0 * * * *`, huso `America/Argentina/Buenos_Aires`), un cron job actualiza en MongoDB a todos los usuarios que tengan menos de 15 tiradas a `15`, y menos de 2 claims a `2`.
2. **Notificación Proactiva:** Aquellos usuarios que hayan agotado sus tiradas y tengan registrado su `last_channel_id` reciben una notificación pública en dicho canal mediante Components V2 anunciando la reposición.
3. **Divisa (Renas):**
   * Tirada de personaje repetido con dueño distinto: se divide el valor fijado en `settings.json` (por defecto 10 renas, resultando en 5 renas para el dueño y 5 para quien tiró).
   * Tirada de personaje propio: el dueño recibe el monto completo (10 renas).
   * Compra de tiradas: 10 renas por tirada.
   * Compra de claims: 100 renas por claim.

---

## 10. Diagnóstico Técnico: Deuda Técnica, Antipatrones y Oportunidades de Mejora

1. **Violación de Principio de Responsabilidad Única (SRP):**
   * Los archivos en `interactions/commands` y `interactions/buttons` combinan lógica de negocio, consultas directas a MongoDB, peticiones HTTP a APIs externas y construcción de componentes visuales en un mismo método.
2. **Duplicación de Responsabilidades y Código Redundante:**
   * Existen dos carpetas de builders: `src/embeds` frente a `src/builders/embeds`.
   * Existen dos carpetas de componentes: `src/components` frente a `src/builders/components`.
   * Caching dual: `Bot` tiene métodos `set`, `get`, `update`, `delete`, pero a su vez instancia `InteractionsManager` que hace exactamente lo mismo por separado.
3. **Peligros en Extensiones de Clases:**
   * En `GuildChatInputCommandInteraction.extension.ts`, el getter `public get guild(): Guild { return this.guild; }` causaría recursión infinita si fuera invocado.
4. **Acoplamiento Directo e Inexistencia de Inyección de Dependencias:**
   * Las capas de comandos importan directamente los singletons de base de datos (`mongo`) y APIs (`anilist`, `mal`, `vndb`), imposibilitando pruebas unitarias aisladas sin recurrir a mocks invasivos.
5. **Falta Absoluta de Suite de Pruebas:**
   * No existen tests unitarios ni de integración para el cálculo de Pearson, validadores, gestores de transacciones ni repositorios.
6. **Manejo de Errores con Tipos Débiles:**
   * Uso indiscriminado de `any` en documentos de base de datos y respuestas de APIs externas.

---

## 11. Especificación de Requerimientos de Refactorización

Para la futura refactorización integral, se aplicarán estrictamente los siguientes estándares de ingeniería de software:

### 11.1 Principios SOLID
* **S (Single Responsibility Principle):** Cada clase tendrá una única razón para cambiar. Los controladores/comandos solo coordinarán; los casos de uso implementarán la regla de negocio; los repositorios gestionarán la persistencia; los adaptadores consumirán APIs externas; y las vistas/factories generarán Discord Components y Embeds.
* **O (Open/Closed Principle):** Extensión mediante interfaces abstractas (ej. soporte para nuevas plataformas de anime mediante una interfaz `MediaProvider`).
* **L (Liskov Substitution Principle):** Las implementaciones concretas de proveedores y repositorios serán intercambiables sin alterar el comportamiento esperado.
* **I (Interface Segregation Principle):** Interfaces pequeñas y específicas para lectura, escritura y operaciones específicas.
* **D (Dependency Inversion Principle):** Los casos de uso y servicios dependerán de interfaces/abstracciones, inyectadas a través del constructor.

### 11.2 Regla de Tamaño de Archivos (~100 Líneas)
* **Ninguna clase o archivo deberá superar aproximadamente las 100 líneas de código.**
* Archivos extensos actuales (ej. `aniuser.ts` de 189 líneas, `gacha.trade.subcommand.ts` de 135 líneas) se modularizarán en submódulos especializados, funciones puras y value objects.

### 11.3 Patrones de Diseño (GoF) Implementados
1. **Command Pattern:** Encapsulación de cada interacción de Discord (Slash Commands, Buttons, Modals) como comandos ejecutables con interfaz uniforme (`BaseSlashCommand`, `IButtonHandler`, `IModalHandler`).
2. **Strategy Pattern:** Proveedores de plataformas de anime y cálculo de afinidad (`PearsonCalculatorService`, `GachaRulesService`).
3. **Factory Method & Abstract Factory:** Fabricación estandarizada y desacoplada de mensajes y tarjetas Discord a través de `EmbedFactory` (`src/presentation/ui/embeds/embed.factory.ts`) y `ComponentFactory` (`src/presentation/ui/components/component.factory.ts`).
4. **Builder Pattern:** Construcción incremental de cartas complejas de Discord Components V2 (`CharacterClaimCardBuilder`, `CharacterInfoCardBuilder`, `AnimeCardBuilder`, `GachaInventoryCardBuilder`, `GachaTradeConfirmCardBuilder`, etc.), manteniendo cada constructor estrictamente por debajo de las 100 líneas.
5. **Chain of Responsibility:** Pipeline de middlewares de interacciones (`MaintenanceMiddleware` -> `CooldownMiddleware` -> `CommandDispatcher`).

### 11.4 Patrones de Arquitectura Empresarial (PEAA - Martin Fowler)
1. **Repository Pattern:** Abstracción total de MongoDB detrás de `IUserRepository`, `ICharacterRepository`, `IGuildRepository`, `IClaimRepository`.
2. **Data Mapper:** Separación limpia entre la entidad del dominio y el formato de almacenamiento en la base de datos.
3. **Service Layer:** Casos de uso (`GachaClaimUseCase`, `TradeCharactersUseCase`, `CalculateAffinityUseCase`) que definen las fronteras de la aplicación.
4. **Value Object:** Clases inmutables para conceptos del dominio como `Renas`, `ColorCode`, `CooldownDuration`, `AffinityPercentage`.
5. **Identity Map / Unit of Work:** Gestión de caché en memoria de interacciones y personajes activos.

### 11.5 Propuesta de Estructura Limpia de Directorios
```
src/
├── core/
│   ├── config/             # Configuración central y variables de entorno
│   ├── errors/             # Jerarquía tipada de errores de dominio
│   ├── utils/              # Funciones auxiliares puras (matemáticas, strings)
│   └── cache/              # Servicio de caché en memoria para estados de interacción
├── domain/
│   ├── entities/           # Entidades puras (User, Character, Guild, Claim)
│   ├── value-objects/      # Objetos de valor (Renas, AffinityResult)
│   └── services/           # Servicios puros de dominio (PearsonService, GachaRules)
├── application/
│   ├── use-cases/          # Casos de uso específicos (ClaimCharacter, Trade, SearchMedia)
│   └── ports/              # Interfaces de repositorios y servicios externos
├── infrastructure/
│   ├── database/           # Conexión MongoDB, colecciones y Data Mappers
│   ├── repositories/       # Implementaciones de repositorios
│   ├── external-apis/      # Clientes HTTP (AniList, MAL, VNDB)
│   └── cron/               # Tareas programadas
└── presentation/
    ├── discord/            # Cliente Discord, middlewares, despachador de eventos
    ├── commands/           # Slash commands adaptados a Casos de Uso
    ├── buttons/            # Handlers de botones
    ├── modals/             # Handlers de modales
    └── ui/                 # Embeds, Component V2 Cards y ActionRows
```

---

## 12. Plan de Pruebas Unitarias y de Integración

Para certificar la confiabilidad del sistema antes y después de cada refactor:
1. **Framework de Pruebas:** `vitest` o `jest` con soporte nativo de TypeScript.
2. **Pruebas Unitarias:**
   * Cálculo del coeficiente de Pearson (`Helpers.pearson`): matrices con puntuaciones idénticas, ortogonales, casos borde con 0 elementos comunes.
   * Reglas de negocio del Gacha: distribución de renas (dueño vs tirador), decremento de pulls/claims, validación de saldo.
   * Validadores de entrada: validación de IDs positivos, nombres válidos, formatos hexadecimales.
3. **Pruebas de Integración:**
   * Repositorios MongoDB utilizando base de datos en memoria (`mongodb-memory-server`).
   * Serializadores de respuestas y mapeo de datos de AniList, MAL y VNDB hacia modelos de dominio.

---

## 13. Estrategia de Resiliencia, Tolerancia a Fallos y Anti-Crash

Para garantizar que el bot nunca se caiga y mantenga informados a los usuarios de manera transparente y profesional:

### 13.1 Jerarquía Tipada de Errores
1. `AppError` (Clase base abstracta con flag `isOperational: boolean`, `userFriendlyMessage: string`, `code: string`).
2. `ExternalApiError` (AniList, MAL, VNDB - errores de red, 5xx, rate limits 429, timeouts). Informa al usuario: *"El servicio externo X no responde en este momento. Inténtalo más tarde"*.
3. `DatabaseError` (MongoDB fuera de línea, timeout de conexión, fallos de lectura/escritura). Informa: *"Ocurrió una interrupción temporal con la base de datos"*.
4. `DomainValidationError` (violaciones de reglas de negocio, falta de fondos, parámetros inválidos).
5. `AuthenticationError` (tokens expirados o revocados).

### 13.2 Blindaje del Proceso (Anti-Crash Global)
* Captura global de `process.on('unhandledRejection')` y `process.on('uncaughtException')` con logging estructurado y sin detener el bucle de eventos.
* Envoltura de todas las interacciones de Discord (Slash, Button, Modal) en un manejador unificado que detecta si la interacción ya fue respondida o diferida (`deferred / replied`), editando o respondiendo efímeramente con el mensaje de error correspondiente sin lanzar excepciones no controladas.
* Fallback informativo claro y amigable al usuario en caso de indisponibilidad parcial.

---

## 14. Estado Actual de la Refactorización e Hitos Alcanzados

### 14.1 Depuración y Eliminación Total de Código y Directorios Obsoletos
* **Eliminación Definitiva de Directorios Huérfanos:**
  * Se eliminaron por completo `src/apis/` (reemplazada por `src/infrastructure/external-apis/` y `src/domain/models/`).
  * Se eliminó por completo `src/interactions/` (reemplazada por `src/presentation/commands/`, `src/presentation/buttons/` y `src/presentation/modals/`).
  * Se eliminaron `src/handlers/buttons.handler.ts`, `src/handlers/commands.handler.ts` y `src/handlers/modals.handler.ts` (reemplazados por `ButtonRegistry`, `ModalRegistry`, `CommandRegistry` y GoF Factories).
  * Se eliminaron `src/bot/modules/interactions-manager.ts` y los helpers obsoletos de cooldowns (`src/helpers/cooldowns.helper.ts`, `src/helpers/claim.cooldown.helper.ts`).
  * Se eliminaron previamente `src/embeds/`, `src/builders/` y `src/components/`.

### 14.2 Nuevo Servicio de Caché y Estado de Interacciones (`InteractionStateService`)
* **Desacoplamiento Total de `Bot`:**
  * Anteriormente `Bot` mutaba los objetos almacenados inyectándoles claves `key` y timers de expiración, manteniendo mapas expuestos en el cliente de Discord.
  * Se diseñó e implementó `InteractionStateService` (`src/infrastructure/cache/interaction-state.service.ts`) como un singleton encapsulado con:
    * Claves criptográficas libres de colisiones vía `crypto.randomUUID()`.
    * Envoltorios de sesión `SessionEntry<T>` inmutables que no tocan ni mutan los objetos del llamador.
    * Control de capacidad máxima (LRU-style bounded eviction) para proteger la memoria contra desbordamientos.
    * Método atómico `consume<T>(key)`: recupera el dato y lo elimina inmediatamente en una sola operación atómica, garantizando la prevención de *race conditions* en los reclamos de gacha (`claim-button`), asegurando que solo el primer usuario gane la reclamación de forma thread-safe.
    * Métodos tipados `set<T>`, `get<T>`, `update<T>`, `delete(key)`, `has(key)`, `clear()` y `size()`.

### 14.3 Arquitectura de Botones y Modales Extensible (`src/presentation/buttons/` y `src/presentation/modals/`)
* **Registros y Despachadores GoF:**
  * `ButtonRegistry` y `ButtonDispatcher`: despacho centralizado con soporte de modo mantenimiento, extracción del `componentId` y resolución automática de datos de sesión en caché.
  * `ModalRegistry` y `ModalDispatcher`: despacho centralizado de formularios modales.
* **Handlers Encapsulados en Clases (Java-style OOP):**
  * 31 botones implementando `IButtonHandler` organizados por dominio:
    * `character/`: `ClaimButton`, `FavButton`, `RenasButton`, `CharacterBackButton`, `CharacterNextButton`, `CharacterFavButton`.
    * `gacha/`: `GachaInventoryBackButton`, `GachaInventoryNextButton`, `GachaTradeConfirmButton`, `GachaTradeAcceptButton`, `GachaSellConfirmButton`, `GachaSellBuyButton`, `GachaAuctionStartButton`, `GachaAuctionPushButton`, `GachaAuctionAcceptPushButton`.
    * `media/`: `MediaBackButton`, `MediaNextButton`, `VnBackButton`, `VnNextButton`.
    * `setup/`: `SetupAnilistButton`, `SetupInstructionsAnilistButton`, `SetupMalButton`, `SetupInstructionsMalButton`, `SetupVndbButton`, `SetupInstructionsVndbButton`, `SetupProfileButton`, `UnsetupButton`.
    * `user/`: `UserDefaultButton`, `UserAnilistButton`, `UserMalButton`, `UserVndbButton`.
  * 5 modales implementando `IModalHandler`:
    * `gacha/`: `GachaAuctionPushModal`.
    * `setup/`: `SetupInstructionsAnilistModal`, `SetupInstructionsMalModal`, `SetupInstructionsVndbModal`, `SetupProfileModal`.
* **GoF Factories:**
  * `ButtonFactory.createAll(): IButtonHandler[]`: instanciación y registro desacoplado de todos los botones.
  * `ModalFactory.createAll(): IModalHandler[]`: instanciación y registro desacoplado de todos los modales.

### 14.4 Arquitectura de Comandos y Sub-Handlers (`src/presentation/commands/`)
* Migración de toda la lógica dispersa a handlers encapsulados en clases:
  * `CharacterGetByIdHandler` y `CharacterGetByNameHandler` en `commands/general/character/`.
  * `AnimeSearchHandler` y `MangaSearchHandler` en `commands/general/media/`.
  * `UserViewHandler` en `commands/general/user/`.
  * `GachaBuyClaimsSubcommand`, `GachaBuyPullsSubcommand`, `GachaInventorySubcommand`, `GachaSellSubcommand`, `GachaTradeSubcommand` en `commands/general/gacha/`.

### 14.5 Scripts de Gestión y Despliegue de Comandos (`scripts/`)
* **Consistencia con la Arquitectura Actual:** Todos los scripts de comandos se conectan directamente a `CommandFactory.createAll()`, eliminando rutas antiguas a archivos obsoletos.
* **Soporte Completo de Operaciones (CRUD de Comandos):**
  * `deploy-commands-global.ts`: Despliegue masivo o individual de comandos en Discord Global.
  * `deploy-commands-guild.ts`: Despliegue masivo o individual inmediato en el servidor de pruebas.
  * `delete-command-global.ts`: Eliminación de un comando específico global buscando por nombre o ID, o lista informativa interactiva si no se pasan argumentos.
  * `delete-command-guild.ts`: Eliminación de un comando específico de servidor buscando por nombre o ID.
  * `delete-commands-global.ts` y `delete-commands-guild.ts`: Vaciado completo de comandos registrados.
* **Configuración Unificada (`script-config.helper.ts`):** Detección inteligente de variables de entorno (`.env`), tokens de producción (`TOKEN_PROD`) o desarrollo (`TOKEN`), y fallback a `config.json`.

### 14.6 Arquitectura de Servicios y APIs Externas (`src/infrastructure/external-apis/`)
* **Cliente HTTP Base (`BaseHttpClient`):**
  * Control de timeouts configurables vía `AbortController`, inyección de User-Agent y cabeceras dinámicas.
  * Captura de errores de red y HTTP (401, 429, 502, timeouts) transformándolos de forma determinista en `ExternalApiError`.
* **Servicios Especializados por Principio SRP:**
  * **AniList:** `AniListHttpClient`, `AniListCharacterService`, `AniListMediaService`, `AniListUserService`, `AniListService` (fachada).
  * **MyAnimeList:** `MalHttpClient`, `MalOAuthService` (PKCE token exchange y refresh con persistencia en `IUserRepository`), `MalUserService` (con auto-renovación de tokens en caso de expiración o 401 via `executeWithTokenRefresh`), `MalService` (fachada).
  * **VNDB:** `VndbHttpClient`, `VndbService` (Kana API con autenticación por token, consultas `/vn`, `ulist` y `scores`).
  * **Cross-Platform Aggregator:** `CrossPlatformScoresService` para recolectar en paralelo las notas de AniList y MyAnimeList de los miembros del servidor con auto-renovación de tokens de miembros.
* **GoF Factory:**
  * `ApiClientFactory` implementa la creación diferida (lazy singleton) de todos los clientes y servicios externos.

### 14.6 Arquitectura de UI y Componentes (`src/presentation/ui/`)
* **GoF Factories:**
  * `EmbedFactory`: Generación tipada y reutilizable de embeds estándar y de feedback (`ErrorEmbed`, `SuccessEmbed`, `LoadingEmbed`, `AffinityEmbed`, `AnimeEmbed`, `MangaEmbed`, `VnEmbed`, `ScoresEmbed`, etc.).
  * `ComponentFactory`: Fabricación de tarjetas interactivas de **Discord Components V2** (`CharacterClaimCardBuilder`, `CharacterInfoCardBuilder`, `AnimeCardBuilder`, `GachaInventoryCardBuilder`, `GachaTradeConfirmCardBuilder`, `GachaTradeAcceptCardBuilder`, `GachaTradeFinishCardBuilder`, `GachaTradeErrorBuilder`, `PatchNotesCardBuilder`, `UserActionRowBuilder`, `VnActionRowBuilder`).

### 14.7 Internacionalización Completa (i18n)
* **Motor i18n (`I18nService`):**
  * Soporte nativo para detección del idioma de la interacción (`interaction.locale`).
  * Normalización con fallback automático a Español (`es-ES`, `es-419`) e Inglés (`en-US`, `en-GB`).
  * Mapeo jerárquico tipado con interpolación de variables dinámicas (`{service}`, `{userId}`, `{price}`, etc.).
* **Localización de Interfaces:**
  * Botones de acción (`Reclamar` / `Claim`, `Recompensa` / `Reward`, `Lo quiero` / `I want it`, `Confirmar intercambio` / `Confirm trade`, `Aceptar intercambio` / `Accept trade`).
  * Mensajes de error y avisos efímeros (`InteractionErrorHandler`, advertencias de cooldown, interacción expirada, falta de permisos).
  * Tarjetas de inventario, afinidad, notas y trade.

### 14.8 Cumplimiento de Restricciones Técnicas
* **Límite Estricto de Líneas por Archivo:**
  * **0 archivos superan las 100 líneas en todo el directorio `src/` y `tests/`.** El 100% de las clases y módulos respeta el límite estricto de `<= ~100 líneas`.
* **Encapsulación OOP a lo Java:**
  * Todo el código encapsulado en clases con modificadores de acceso (`public`, `protected`, `private`, `readonly`), alta cohesión y bajo acoplamiento.
* **Suite de Pruebas Automatizadas:**
  * **25 suites de pruebas (25 archivos de test).**
  * **88 pruebas unitarias e integración pasando al 100%** mediante `vitest`.
  * Verificación continua de tipos con TypeScript Compiler (`pnpm exec tsc --noEmit` con 0 errores).



