import { EmbedBuilder } from "discord.js";

export default class HelpEmbed extends EmbedBuilder {
    constructor () {
        super();
        this.setColor('DarkOrange');
        this.setDescription(
            '**¡Todos mis comandos!**\n\n' +
            '\`/help\` ▸ Muestra esta página.\n' + 
            '\`/setup\` ▸ Vincula tu cuenta de anilist.\n' + 
            '\`/unsetup\` ▸ Desvincula tu cuenta de anilist.\n' + 
            '\`/show-scores\` ▸ Decide si mostrar tus calificaciones en este servidor.\n' + 
            '\`/user\` ▸ Muestra la información de anilist de un usuario.\n' + 
            '\`/anime\` ▸ Busca un anime, muestra su información y calificaciones.\n' + 
            '\`/manga\` ▸ Busca un manga, muestra su información y calificaciones.\n' + 
            '\`/vn\` ▸ Busca una novela visual y muestra su información.\n' +
            '\`/affinity\` ▸ Calcula la afinidad entre dos usuarios basándose en sus calificaciones.\n' +
            '\`/random\` ▸ Devuelve un anime o manga aleatorio de tu PTW.\n\n' +
            '**¡Últimos comandos agregados!**\n' +
            `¡Intercambios! \`/exchange help\` \`/exchange create\`\n\n` +
            `[¡Invítame a tu servidor!](https://discord.com/oauth2/authorize?client_id=705972499367591953)`
        );
    };
};