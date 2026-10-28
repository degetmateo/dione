import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { ApiClientFactory } from '../../../../infrastructure/external-apis/api-client.factory';
import mongo from '../../../../database/mongo';
import AnimeValidator from '../../../../validators/animeValidator';
import { ErrorEmbed, MangaEmbed, ScoresEmbed } from '../../../ui';
import Helpers from '../../../../helpers';
import { InteractionStateService } from '../../../../infrastructure/cache/interaction-state.service';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { BusinessRuleError } from '../../../../core/errors';

export class MangaSearchHandler {
    public static async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply();
        const args = interaction.options.getString('name-or-id', true);
        const loc = interaction.locale;
        const anilist = ApiClientFactory.getAniListClient();
        const scoresService = ApiClientFactory.getCrossPlatformScoresService();

        const memberships = await mongo.memberships.find({ guild_id: interaction.guildId, show_scores: true }).toArray();
        const members = await mongo.users.find({
            $and: [{ _id: { $in: memberships.map(m => m.user_id) } }, { preferred_platform: { $ne: null } }],
        }).toArray();

        if (Helpers.isNumber(args)) {
            AnimeValidator.validateId(args);
            const data = await anilist.search.manga.id(args);
            const mangaEmbed = new MangaEmbed(data);
            if (members.length <= 0) {
                await interaction.editReply({ embeds: [mangaEmbed] });
                return;
            }
            const scores = await scoresService.searchScores({ ...data, type: 'MANGA' }, members as any);
            const nobodyMsg = I18nService.t(loc, 'media.nobodyKnows');
            const scoresEmbed = scores.length > 0 ? new ScoresEmbed(scores, loc) : new ErrorEmbed(nobodyMsg);
            await interaction.editReply({ embeds: [mangaEmbed, scoresEmbed] });
            return;
        }

        AnimeValidator.validateName(args);
        const data: { media: any[] } = await anilist.search.manga.name(args);
        if (!data?.media || data.media.length <= 0) {
            throw new BusinessRuleError(I18nService.t(loc, 'api.notFound', { service: 'AniList' }));
        }

        const media = data.media;
        const embeds = media.map(m => new MangaEmbed(m));
        const scoresEmbeds: EmbedBuilder[] = [];
        const index = 0;
        const nobodyMsg = I18nService.t(loc, 'media.nobodyKnows');

        if (members.length <= 0) {
            scoresEmbeds[index] = new ErrorEmbed(nobodyMsg);
        } else {
            const scores = await scoresService.searchScores({ ...media[index], type: 'MANGA' }, members as any);
            scoresEmbeds[index] = scores.length > 0 ? new ScoresEmbed(scores, loc) : new ErrorEmbed(nobodyMsg);
        }

        const cacheId = InteractionStateService.getInstance().set({
            members, embeds, media, scores: scoresEmbeds, index,
        }, 180_000);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(`media-back-button_${cacheId}`).setLabel('←').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`media-next-button_${cacheId}`).setLabel('→').setStyle(ButtonStyle.Primary)
        );

        await interaction.editReply({ embeds: [embeds[index], scoresEmbeds[index]], components: [row] });
    }
}

