import { EmbedBuilder, ColorResolvable } from 'discord.js';

export class BaseEmbedBuilder extends EmbedBuilder {
    public constructor() {
        super();
        this.setTimestamp();
    }

    public withColor(color: ColorResolvable): this {
        this.setColor(color);
        return this;
    }

    public withDescription(description: string): this {
        this.setDescription(description);
        return this;
    }

    public withTitle(title: string, url?: string): this {
        this.setTitle(title);
        if (url) this.setURL(url);
        return this;
    }
}

