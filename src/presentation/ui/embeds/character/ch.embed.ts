import { EmbedBuilder } from 'discord.js';

export interface ChEmbedData {
    name: string;
    site_url: string;
    image_url: string;
    claimed_count: number;
    user_id: string | null;
}

export class ChEmbed extends EmbedBuilder {
    public constructor(character: ChEmbedData) {
        super();
        this.setTitle(character.name);
        this.setURL(character.site_url);
        this.setImage(character.image_url);
        this.setColor('Random');
        this.setFooter({
            text: `Se ha reclamado ${character.claimed_count === 1 ? '1 vez' : `${character.claimed_count} veces`}.`,
        });

        if (character.user_id) {
            this.setDescription(`<@${character.user_id}>`);
        }
    }
}

