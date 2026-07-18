import { Colors, EmbedBuilder } from "discord.js";

export default class ExchangeHelpEmbed extends EmbedBuilder {
    constructor () {
        super();
        this.setColor(Colors.Orange);
        
        const desc = 
            `**A continuación: ¡ayuda para intercambios!**\n\n` +
            `El grupo de comandos de intercambio permite gestionar intercambios de animes/mangas con otros usuarios.\n\n` +
            `▸ Un intercambio es creado por un usuario "A" utilizando \`/exchange create\`. Para crearlo se necesitan dos datos: otro usuario "B" y un anime/manga.\n\n` +
            `▸ Cuando usuario "A" crea el intercambio, usuario "B" debe aceptarlo y devolver otro anime/manga para intercambiar.\n\n` +
            `▸ Luego, usuario "A" debe aceptar el anime/manga que usuario "B" le devolvió.\n\n` +
            `Para que un intercambio se considere completado, cada usuario debe indicar que el otro completó su obra asignada utilizando \`/exchange complete\`. Al momento de hacer esto, cada usuario ya debe tener la obra listada como completada en su anilist.\n\n` +
            `Cuando ambos usuarios ejecuten exitosamente \`/exchange complete\`, el intercambio se dará por finalizado y quedará registrado para futuras funcionalidades.\n\n` +
            `Cualquiera de los dos usuarios puede cancelar el intercambio sin finalizar utilizando \`/exchange cancel\`. Por el momento, cada usuario puede tener un solo intercambio activo a la vez.\n\n` +
            `[¿Quieres intercambios en tu servidor? ¡Invítame!](https://discord.com/oauth2/authorize?client_id=705972499367591953)`;

        this.setDescription(desc);
    };
};