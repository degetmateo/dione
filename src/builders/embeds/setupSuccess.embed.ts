import { Colors, EmbedBuilder } from "discord.js";

export default class SetupSuccessEmbed extends EmbedBuilder {
     constructor (name: string, url: string) {
        super();
        this.setColor(Colors.Green)
        this.setDescription(`Autentificación completada correctamente como [${name}](${url}). Utilizá \`/show-scores\` para decidir si mostrar tus puntuaciones en este servidor.`)
     };
};