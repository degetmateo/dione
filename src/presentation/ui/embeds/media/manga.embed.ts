import { ColorResolvable, EmbedBuilder } from 'discord.js';
import Helpers from '../../../../helpers';

export class MangaEmbed extends EmbedBuilder {
    public constructor(data: any) {
        super();

        const titles = Helpers.deleteRepeatedElements([
            data.title?.romaji,
            data.title?.english,
            data.title?.native,
        ].filter(Boolean));

        let description = data.description ? Helpers.clearHTML(data.description) : null;
        if (description && description.length > 4096) {
            description = description.slice(0, 4090) + '...';
        }

        this.setColor((data.coverImage?.color as ColorResolvable) ?? null);
        this.setThumbnail(data.coverImage?.extraLarge || data.coverImage?.large || data.coverImage?.medium || null);
        this.setTitle(data.title?.userPreferred || 'Manga');
        this.setURL(data.siteUrl || null);
        if (description) this.setDescription(description);
        this.setImage(data.bannerImage || null);
        if (titles.length) this.setFooter({ text: titles.join(' | ') });

        const info1 =
            `‣ **Formato**: ${data.format || 'Desconocido'}\n` +
            `‣ **Estado**: ${data.status || 'Desconocido'}\n` +
            `‣ **Calificación**: ${data.meanScore ? data.meanScore + '/100' : 'Desconocida'}\n` +
            `‣ **Popularidad**: ${data.popularity || 'Desconocida'}\n` +
            `‣ **Favoritos**: ${data.favourites || 'Desconocido'}`;

        const d = data.startDate;
        const dateText = d?.year ? `${d.day ?? 1}/${d.month ?? 1}/${d.year}` : 'Desconocida';
        const info2 =
            `‣ **ID**: ${data.id}\n` +
            `‣ **Emisión**: ${dateText}\n` +
            `‣ **Capítulos**: ${data.chapters || 'idk'}\n` +
            `‣ **Volúmenes**: ${data.volumes || 'idk'}\n` +
            `‣ **Fuente**: ${data.source || 'Desconocido'}`;

        this.addFields(
            { name: '▾', value: info1, inline: true },
            { name: '▾', value: info2, inline: true }
        );

        const genres = data.genres?.length ? '`' + data.genres.join('` - `') + '`' : '`Desconocidos`';
        this.addFields({ name: '▾ Géneros', value: genres, inline: false });

        const tags = (data.tags || []).filter((t: any) => !t.isMediaSpoiler).map((t: any) => t.name);
        const tagsValue = tags.length ? '`' + tags.join('` - `') + '`' : '`Desconocidos`';
        this.addFields({ name: '▾ Etiquetas', value: tagsValue, inline: false });
    }
}

