import { Colors, EmbedBuilder } from 'discord.js';

export class ErrorEmbed extends EmbedBuilder {
    public constructor(message: string) {
        super();
        this.setColor(Colors.DarkRed);
        this.setDescription(message);
    }
}

