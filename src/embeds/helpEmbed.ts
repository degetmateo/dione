import { EmbedBuilder } from "discord.js";

export default class HelpEmbed extends EmbedBuilder {
    constructor () {
        super();
        this.setColor('DarkOrange');
        this.setDescription(
            '**¡Todos mis comandos!**\n\n' +
            '\`/help\` ▸ Muestra esta página.\n' + 
            '\`/setup\` ▸ Vincula tu cuenta de \`ANILIST\` o \`MyAnimeList\`.\n' + 
            '\`/unsetup\` ▸ Desvincula alguna de tus cuentas.\n' + 
            '\`/show-scores\` ▸ Decide si mostrar tus calificaciones en este servidor.\n' + 
            '\`/user\` ▸ Muestra la información de \`ANILIST\` o \`MyAnimeList\` de un usuario.\n' + 
            '\`/anime\` ▸ Busca un anime, muestra su información y calificaciones.\n' + 
            '\`/manga\` ▸ Busca un manga, muestra su información y calificaciones.\n' + 
            '\`/vn\` ▸ Busca una novela visual y muestra su información.\n' +
            '\`/affinity\` ▸ Calcula la afinidad entre dos usuarios basándose en sus calificaciones. Solo para usuarios de \`MyAnimeList\`.\n' +
            '\`/random\` ▸ Devuelve un anime o manga aleatorio de tu PTW. Solo para usuarios de \`MyAnimeList\`.\n\n' +
            '**¡Últimos comandos agregados!**\n' +
            `¡Intercambios! \`/exchange help\` \`/exchange create\`\n\n` +
            `[¡Invítame a tu servidor!](https://discord.com/oauth2/authorize?client_id=705972499367591953)`
        );
    };
};