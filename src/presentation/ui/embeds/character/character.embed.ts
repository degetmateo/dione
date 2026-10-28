import { EmbedBuilder } from 'discord.js';

export interface CharacterEmbedData {
    id: number;
    name: { full: string | null; userPreferred: string };
    siteUrl: string;
    favourites: number;
    owner_id?: string | null;
    claimed_count?: number | null;
    age?: string | null;
    gender?: string | null;
    bloodType?: string | null;
    image?: { large: string | null; medium: string | null };
    media?: { nodes: Array<{ favourites: number; title: { userPreferred: string }; siteUrl: string }> };
}

export class CharacterEmbed extends EmbedBuilder {
    public constructor(character: CharacterEmbedData) {
        super();
        this.setTitle(character.name.full || character.name.userPreferred);
        this.setURL(character.siteUrl);
        this.setImage(character.image?.large || character.image?.medium || null);
        this.setColor('Random');

        let desc = '';
        const nodes = character.media?.nodes ?? [];
        if (nodes.length > 0) {
            const sorted = [...nodes].sort((a, b) => b.favourites - a.favourites);
            desc += `[${sorted[0].title.userPreferred}](${sorted[0].siteUrl})`;
        }

        if (character.owner_id) desc += `\n▸ Pertenece a <@${character.owner_id}>`;
        desc += `\n▸ Favoritos: \`${character.favourites}\``;
        if (character.claimed_count) desc += `\n▸ Reclamado: \`${character.claimed_count} veces\``;
        if (character.age) desc += `\n▸ Edad: \`${character.age}\``;
        if (character.gender) desc += `\n▸ Género: \`${character.gender}\``;
        if (character.bloodType) desc += `\n▸ Tipo de sangre: \`${character.bloodType}\``;

        this.setDescription(desc || 'Sin información adicional.');
    }
}

