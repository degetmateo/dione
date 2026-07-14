import { Colors, EmbedBuilder } from "discord.js";

export default class ErrorEmbed extends EmbedBuilder {
    constructor (message: string) {
        super();
        this.setColor(Colors.DarkRed);
        this.setDescription(message);
    };
};