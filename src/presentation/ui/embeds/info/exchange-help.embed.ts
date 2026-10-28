import { Colors, EmbedBuilder } from 'discord.js';

export class ExchangeHelpEmbed extends EmbedBuilder {
    public constructor() {
        super();
        this.setColor(Colors.Orange);
        this.setDescription(
            `**A continuación: ¡ayuda para intercambios!**\n\n` +
            `El grupo de comandos de intercambio permite gestionar intercambios de animes/mangas con otros usuarios.\n\n` +
            `▸ Un intercambio es creado por un usuario "A" utilizando \`/exchange create\`.\n` +
            `▸ Cuando usuario "A" crea el intercambio, usuario "B" debe aceptarlo y devolver otro anime/manga.\n` +
            `▸ Luego, usuario "A" debe aceptar el anime/manga que usuario "B" le devolvió.\n\n` +
            `Para finalizar, cada usuario indica que el otro completó su obra con \`/exchange complete\`.\n` +
            `Cualquiera puede cancelar con \`/exchange cancel\`.\n\n` +
            `[¿Quieres intercambios en tu servidor? ¡Invítame!](https://discord.com/oauth2/authorize?client_id=705972499367591953)`
        );
    }
}

