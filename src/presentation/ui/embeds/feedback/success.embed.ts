import { Colors, EmbedBuilder } from 'discord.js';

export class SuccessEmbed extends EmbedBuilder {
    public constructor(message: string) {
        super();
        this.setColor(Colors.Green);
        this.setDescription(message);
    }
}

