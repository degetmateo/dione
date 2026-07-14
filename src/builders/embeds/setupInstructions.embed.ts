import { EmbedBuilder } from "discord.js";

export default class SetupInstructionsEmbed extends EmbedBuilder {
     constructor () {
        super();

        this
            .setTitle('Instrucciones')
            .setColor(0xff8c00)
            .setFooter({ text: "No compartas los códigos con nadie." })
            .setDescription((
                `▸ Haz click en el botón **Autorizar**.\n`+
                `▸ Una vez dentro de la página web, debes presionar en **Authorize**.\n` +
                `▸ Se generará tu código de autentificación, debes copiarlo.\n` +
                `▸ Cierra la página web y vuelve aquí, haz click en el botón **Ingresar código**.\n` +
                `▸ Pega el código en el formulario y envíalo.`
            ));
     };
};