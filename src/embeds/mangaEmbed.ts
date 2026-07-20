import { ColorResolvable, EmbedBuilder } from "discord.js";
import Helpers from "../helpers";

export default class MangaEmbed extends EmbedBuilder {
    constructor (data: any) {
        super();

        let titles = [];
        if (data.title.romaji) titles.push(data.title.romaji);
        if (data.title.english) titles.push(data.title.english);
        if (data.title.native) titles.push(data.title.native);
        titles = Helpers.deleteRepeatedElements(titles);

        if (data.description) {
            data.description = Helpers.clearHTML(data.description);

            if (data.description.length > 4096) {
                data.description = data.description.slice(0, 4090) + '...';
            };
        };

        this.setColor(data.coverImage.color as ColorResolvable || null);
        this.setThumbnail(data.coverImage.extraLarge || data.coverImage.large || data.coverImage.medium || null);
        this.setTitle(data.title.userPreferred);
        this.setURL(data.siteUrl || null);
        this.setDescription(data.description || null);
        this.setImage(data.bannerImage || null);
        this.setFooter({ text: titles.join(' | ') });

        const informacionCampos1 = `
            ‣ **Formato**: ${data.format || 'Desconocido'}\n‣ **Estado**: ${data.status || 'Desconocido'}\n‣ **Calificación**: ${data.meanScore ? data.meanScore + '/100' : 'Desconocida'}\n‣ **Popularidad**: ${data.popularity || 'Desconocida'}\n‣ **Favoritos**: ${data.favourites || 'Desconocido'}
        `;

        const fecha = data.startDate;
        const fechaText = fecha ? `${fecha.day}/${fecha.month}/${fecha.year}` : 'Desconocida';

        const informacionCampos2 = `
            ‣ **ID**: ${data.id}\n‣ **Emisión**: ${fechaText}\n‣ **Capítulos**: ${data.chapters || 'idk'}\n‣ **Volúmenes**: ${data.volumes || 'idk'}\n‣ **Fuente**: ${data.source || 'Desconocido'}
        `;

        this
            .addFields(
                { name: "▾", value: informacionCampos1, inline: true },
                { name: "▾", value: informacionCampos2, inline: true }
            )

        const generosInfo = (!data.genres || data.genres.length === 0) ?
                '\`Desconocidos\`' : '`' + data.genres.join('` - `') + '`';

        this.addFields({ name: "▾ Géneros", value: generosInfo, inline: false })

        const tagsData = data.tags || [];
        const tags = tagsData.filter((t: { name: string; isMediaSpoiler: boolean }) => !t.isMediaSpoiler);
        const tagsMapped = tags.map((t: any) => t.name);

        const tagsValue = tags.length >= 1 ?
            '`' + tagsMapped.join('` - `') + '`' : '`Desconocidos`';

        this.addFields({ name: "▾ Etiquetas", value: tagsValue, inline: false });  
    };
};