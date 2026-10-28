import {
    ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
} from 'discord.js';
import { Anianime } from '../../../../domain/models';

export class AnimeCardBuilder extends ContainerBuilder {
    public constructor(anime: Anianime) {
        super();
        this.setAccentColor(anime.getColorAsRGBTuple());

        this.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## [${anime.getTitle()}](${anime.getSiteUrl()})`),
            new TextDisplayBuilder().setContent(anime.getDescription() || '')
        );

        const metaSection = new SectionBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(this.buildMetaText(anime))
        );

        if (anime.getCoverImageUrl()) {
            metaSection.setThumbnailAccessory(new ThumbnailBuilder().setURL(anime.getCoverImageUrl()!));
        }
        this.addSectionComponents(metaSection);

        const genres = anime.getGenres().length ? '`' + anime.getGenres().join('` - `') + '`' : '`Desconocidos`';
        const studios = anime.getStudios().length ? '`' + anime.getStudios().join('` - `') + '`' : '`Desconocidos`';
        const tags = anime.getNoSpoilerTags().length ? '`' + anime.getNoSpoilerTags().join('` - `') + '`' : '`Desconocidas`';

        this.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`### Géneros\n${genres}`),
            new TextDisplayBuilder().setContent(`### Estudios\n${studios}`),
            new TextDisplayBuilder().setContent(`### Etiquetas\n${tags}`)
        );

        if (anime.getBannerImageUrl()) {
            this.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(anime.getBannerImageUrl()!))
            );
        }

        if (anime.getSynonyms()?.length) {
            this.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`-# ${anime.getSynonyms().join(' | ')}`)
            );
        }
    }

    private buildMetaText(anime: Anianime): string {
        return (
            `### Ficha Técnica\n` +
            `ID: \`${anime.getId()}\` - Formato: \`${anime.getFormat() || 'Desconocido'}\` - ` +
            `Fuente: \`${anime.getSource() || 'Desconocida'}\` - Estado: \`${anime.getStatus() || 'Desconocido'}\` - ` +
            `Temporada: \`${anime.getSeason() || 'Desconocida'}\` - Emisión: \`${anime.getStartDate() || 'Desconocida'}\` - ` +
            `Episodios: \`${anime.getEpisodes() || 'Desconocidos'}\` - Calificación: \`${anime.getMeanScore()}/100\` - ` +
            `Popularidad: \`${anime.getPopularity() || 'Desconocida'}\` - Favoritos: \`${anime.getFavourites() || 'Desconocidos'}\``
        );
    }
}

