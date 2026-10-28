import { EmbedBuilder } from 'discord.js';

export class HelpEmbed extends EmbedBuilder {
    public constructor() {
        super();
        this.setColor('DarkOrange');
        this.setDescription(
            '**¡Todos mis comandos!**\n\n' +
            '`/help` ▸ Muestra esta página.\n' +
            '`/setup` ▸ Vincula tu cuenta de `ANILIST` o `MyAnimeList`.\n' +
            '`/unsetup` ▸ Desvincula alguna de tus cuentas.\n' +
            '`/show-scores` ▸ Decide si mostrar tus calificaciones en este servidor.\n' +
            '`/user` ▸ Muestra la información de `ANILIST` o `MyAnimeList` de un usuario.\n' +
            '`/anime` ▸ Busca un anime, muestra su información y calificaciones.\n' +
            '`/manga` ▸ Busca un manga, muestra su información y calificaciones.\n' +
            '`/vn` ▸ Busca una novela visual y muestra su información.\n' +
            '`/affinity` ▸ Calcula la afinidad entre dos usuarios basándose en sus calificaciones.\n' +
            '`/random` ▸ Devuelve un anime o manga aleatorio de tu PTW.\n' +
            '`/character` ▸ Devuelve la información de un personaje.\n' +
            '`/ch` ▸ Tirada para reclamar personajes.\n' +
            '`/gacha buy-pulls` ▸ Adquiere `pulls` usando `renas`.\n' +
            '`/gacha buy-claims` ▸ Adquiere `claims` usando `renas`.\n' +
            '`/gacha inventory` ▸ Lista de personajes de un usuario.\n' +
            '`/gacha trade` ▸ Intercambiar dos personajes con otro usuario.\n\n' +
            '[¡Invítame a tu servidor!](https://discord.com/oauth2/authorize?client_id=705972499367591953)'
        );
    }
}

