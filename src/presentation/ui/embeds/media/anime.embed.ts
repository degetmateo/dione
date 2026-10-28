import { EmbedBuilder } from 'discord.js';
import { Anianime } from '../../../../domain/models';

export class AnimeEmbed extends EmbedBuilder {
    public constructor(anime: Anianime) {
        super();

        let description = anime.getDescription();
        if (description && description.length > 4096) {
            description = description.slice(0, 4090) + '...';
        }

        this.setColor(anime.getColorAsResolvable());
        this.setThumbnail(anime.getCoverImageUrl());
        this.setTitle(anime.getTitle());
        this.setURL(anime.getSiteUrl());
        if (description) this.setDescription(description);
        this.setImage(anime.getBannerImageUrl());

        if (anime.getSynonyms().length > 0) {
            this.setFooter({ text: anime.getSynonyms().join(' | ') });
        }

        const fieldA =
            `‣ **ID**: \`${anime.getId()}\`\n` +
            `‣ **Fuente**: \`${anime.getSource() || 'IDK'}\`\n` +
            `‣ **Formato**: \`${anime.getFormat() || 'IDK'}\`\n` +
            `‣ **Estado**: \`${anime.getStatus() || 'IDK'}\`\n` +
            `‣ **Emisión**: \`${anime.getStartDate() || 'IDK'}\``;

        const fieldB =
            `‣ **Temporada**: \`${anime.getSeason() || 'IDK'}\`\n` +
            `‣ **Episodios**: \`${anime.getEpisodes() || 'IDK'}\`\n` +
            `‣ **Calificación**: \`${anime.getMeanScore() ? anime.getMeanScore() + '/100' : 'IDK'}\`\n` +
            `‣ **Popularidad**: \`${anime.getPopularity() || 'IDK'}\`\n` +
            `‣ **Favoritos**: \`${anime.getFavourites() || 'IDK'}\``;

        this.addFields(
            { name: '▾', value: fieldA, inline: true },
            { name: '▾', value: fieldB, inline: true }
        );

        const genres = anime.getGenres().length ? '`' + anime.getGenres().join('` - `') + '`' : '`Desconocidos`';
        const studios = anime.getStudios().length ? '`' + anime.getStudios().join('` - `') + '`' : '`Desconocidos`';
        const tags = anime.getNoSpoilerTags().length ? '`' + anime.getNoSpoilerTags().join('` - `') + '`' : '`Desconocidas`';

        this.addFields(
            { name: 'Géneros', value: genres, inline: false },
            { name: 'Estudios', value: studios, inline: false },
            { name: 'Etiquetas', value: tags, inline: false }
        );
    }
}

