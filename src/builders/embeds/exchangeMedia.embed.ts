import { ColorResolvable, EmbedBuilder } from "discord.js";
import Helpers from "../../helpers";

export default class ExchangeMediaEmbed extends EmbedBuilder {
    constructor (data: any) {
        super();
        this.setColor(data.coverImage.color as ColorResolvable || null);
        this.setTitle(data.title.userPreferred);
        this.setURL(data.siteUrl || null);
        this.setImage(data.bannerImage || null);

        if (data.description) {
            data.description = Helpers.clearHTML(data.description);

            if (data.description.length > 4096) {
                data.description = data.description.slice(0, 4090) + '...';
            };
        };

        this.setDescription(data.description || null);
    };
};