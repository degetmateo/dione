import { ColorResolvable, EmbedBuilder } from 'discord.js';
import Helpers from '../../../../helpers';

export class ExchangeMediaEmbed extends EmbedBuilder {
    public constructor(data: any) {
        super();
        this.setColor((data.coverImage?.color as ColorResolvable) || null);
        this.setTitle(data.title?.userPreferred || 'Media');
        this.setURL(data.siteUrl || null);
        this.setImage(data.bannerImage || null);

        let desc = data.description ? Helpers.clearHTML(data.description) : null;
        if (desc && desc.length > 4096) {
            desc = desc.slice(0, 4090) + '...';
        }
        this.setDescription(desc);
    }
}

