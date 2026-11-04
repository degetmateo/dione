import { EmbedBuilder } from 'discord.js';
import { MangaData, MangaModel } from '../../../../domain/models';
import { I18nService } from '../../../../core/i18n/i18n.service';

export class MangaEmbed extends EmbedBuilder {
    public constructor(input: MangaModel | MangaData | any, locale?: string) {
        super();
        const manga = input instanceof MangaModel ? input : new MangaModel(input);
        const isMal = manga.getProvider() === 'MAL';
        const unk = I18nService.t(locale, 'media.unknownLabel');

        let description = manga.getDescription();
        if (description && description.length > 4096) {
            description = description.slice(0, 4090) + '...';
        }

        this.setColor(manga.getColorAsResolvable());
        if (manga.getCoverImageUrl()) this.setThumbnail(manga.getCoverImageUrl());
        this.setTitle(manga.getTitle());
        if (manga.getSiteUrl()) this.setURL(manga.getSiteUrl());
        if (description) this.setDescription(description);
        if (manga.getBannerImageUrl()) this.setImage(manga.getBannerImageUrl());

        const titles = manga.getFooterTitles();
        if (titles.length > 0) this.setFooter({ text: titles.join(' | ').slice(0, 2048) });

        const popLine = isMal && manga.getRank()
            ? `‣ **${I18nService.t(locale, 'media.rankLabel')}**: \`#${manga.getRank()}\` | **${I18nService.t(locale, 'media.popularityLabel')}**: \`#${manga.getPopularity() || unk}\``
            : `‣ **${I18nService.t(locale, 'media.popularityLabel')}**: \`${manga.getPopularity() || unk}\``;

        const info1 =
            `‣ **${I18nService.t(locale, 'media.formatLabel')}**: \`${manga.getFormat() || unk}\`\n` +
            `‣ **${I18nService.t(locale, 'media.statusLabel')}**: \`${manga.getStatus() || unk}\`\n` +
            `‣ **${I18nService.t(locale, 'media.scoreLabel')}**: \`${manga.getFormattedScore() || unk}\`\n` +
            `${popLine}\n` +
            `‣ **${I18nService.t(locale, 'media.favoritesLabel')}**: \`${manga.getFavourites() ?? unk}\``;

        const idTitle = isMal ? 'ID (MAL)' : 'ID';
        const originLine = isMal
            ? `‣ **${I18nService.t(locale, 'media.authorsLabel')}**: \`${manga.getAuthors().join('; ') || unk}\``
            : `‣ **${I18nService.t(locale, 'media.sourceLabel')}**: \`${manga.getSource() || unk}\``;

        const info2 =
            `‣ **${idTitle}**: \`${manga.getDisplayId()}\`\n` +
            `‣ **${I18nService.t(locale, 'media.airedLabel')}**: \`${manga.getStartDate() || unk}\`\n` +
            `‣ **${I18nService.t(locale, 'media.chaptersLabel')}**: \`${manga.getChapters() || unk}\`\n` +
            `‣ **${I18nService.t(locale, 'media.volumesLabel')}**: \`${manga.getVolumes() || unk}\`\n` +
            `${originLine}`;

        this.addFields(
            { name: '▾', value: info1, inline: true },
            { name: '▾', value: info2, inline: true }
        );

        const genres = manga.getGenres().length ? '`' + manga.getGenres().join('` - `') + '`' : `\`${unk}\``;
        this.addFields({ name: `▾ ${I18nService.t(locale, 'media.genresLabel')}`, value: genres, inline: false });

        const cleanTags = manga.getNoSpoilerTags();
        if (!isMal || cleanTags.length > 0) {
            const tagsVal = cleanTags.length ? '`' + cleanTags.join('` - `') + '`' : `\`${unk}\``;
            const tagsTitle = isMal ? I18nService.t(locale, 'media.themesLabel') : I18nService.t(locale, 'media.tagsLabel');
            this.addFields({ name: `▾ ${tagsTitle}`, value: tagsVal, inline: false });
        }
    }
}
