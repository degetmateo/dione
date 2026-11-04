import { EmbedBuilder } from 'discord.js';
import { Anianime, AnianimeData, AnimeModel } from '../../../../domain/models';
import { I18nService } from '../../../../core/i18n/i18n.service';

export class AnimeEmbed extends EmbedBuilder {
    public constructor(input: Anianime | AnianimeData, locale?: string) {
        super();
        const anime = input instanceof AnimeModel ? input : new Anianime(input);
        const isMal = anime.getProvider() === 'MAL';
        const unk = I18nService.t(locale, 'media.unknownLabel');

        let description = anime.getDescription();
        if (description && description.length > 4096) {
            description = description.slice(0, 4090) + '...';
        }

        this.setAuthor({ name: isMal ? 'MyAnimeList' : 'AniList' });
        this.setColor(anime.getColorAsResolvable());
        if (anime.getCoverImageUrl()) this.setThumbnail(anime.getCoverImageUrl());
        this.setTitle(anime.getTitle());
        if (anime.getSiteUrl()) this.setURL(anime.getSiteUrl());
        if (description) this.setDescription(description);
        if (anime.getBannerImageUrl()) this.setImage(anime.getBannerImageUrl());

        if (anime.getSynonyms().length > 0) {
            this.setFooter({ text: anime.getSynonyms().join(' | ').slice(0, 2048) });
        }

        const idTitle = isMal ? 'ID (MAL)' : 'ID';
        const fieldA =
            `‣ **${idTitle}**: \`${anime.getDisplayId()}\`\n` +
            `‣ **${I18nService.t(locale, 'media.sourceLabel')}**: \`${anime.getSource() || unk}\`\n` +
            `‣ **${I18nService.t(locale, 'media.formatLabel')}**: \`${anime.getFormat() || unk}\`\n` +
            `‣ **${I18nService.t(locale, 'media.statusLabel')}**: \`${anime.getStatus() || unk}\`\n` +
            `‣ **${I18nService.t(locale, 'media.airedLabel')}**: \`${anime.getStartDate() || unk}\``;

        const popLine = isMal && anime.getRank()
            ? `‣ **${I18nService.t(locale, 'media.rankLabel')}**: \`#${anime.getRank()}\` | **${I18nService.t(locale, 'media.popularityLabel')}**: \`#${anime.getPopularity() || unk}\``
            : `‣ **${I18nService.t(locale, 'media.popularityLabel')}**: \`${anime.getPopularity() || unk}\``;

        const fieldB =
            `‣ **${I18nService.t(locale, 'media.seasonLabel')}**: \`${anime.getSeason() || unk}\`\n` +
            `‣ **${I18nService.t(locale, 'media.episodesLabel')}**: \`${anime.getEpisodes() || unk}\`\n` +
            `‣ **${I18nService.t(locale, 'media.scoreLabel')}**: \`${anime.getFormattedScore() || unk}\`\n` +
            `${popLine}\n` +
            `‣ **${I18nService.t(locale, 'media.favoritesLabel')}**: \`${anime.getFavourites() ?? unk}\``;

        this.addFields(
            { name: '▾', value: fieldA, inline: true },
            { name: '▾', value: fieldB, inline: true }
        );

        const genres = anime.getGenres().length ? '`' + anime.getGenres().join('` - `') + '`' : `\`${unk}\``;
        const studios = anime.getStudios().length ? '`' + anime.getStudios().join('` - `') + '`' : `\`${unk}\``;
        this.addFields(
            { name: I18nService.t(locale, 'media.genresLabel'), value: genres, inline: false },
            { name: I18nService.t(locale, 'media.studiosLabel'), value: studios, inline: false }
        );

        const cleanTags = anime.getNoSpoilerTags();
        if (!isMal || cleanTags.length > 0) {
            const tagsVal = cleanTags.length ? '`' + cleanTags.join('` - `') + '`' : `\`${unk}\``;
            const thirdTitle = isMal ? I18nService.t(locale, 'media.themesLabel') : I18nService.t(locale, 'media.tagsLabel');
            this.addFields({ name: thirdTitle, value: tagsVal, inline: false });
        }
    }
}
