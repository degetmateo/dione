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
        const mediaService = ApiClientFactory.getResilientMediaService();
        const scoresService = ApiClientFactory.getCrossPlatformScoresService();

        const memberships = await mongo.memberships.find({ guild_id: interaction.guildId, show_scores: true }).toArray();
        const members = await mongo.users.find({
            $and: [{ _id: { $in: memberships.map(m => m.user_id) } }, { preferred_platform: { $ne: null } }],
        }).toArray();

        if (Helpers.isNumber(args)) {
            AnimeValidator.validateId(args);
            const result = await mediaService.searchMangaById(args);
            const data = result.data;
            const mangaEmbed = new MangaEmbed(data, loc);
            const content = result.fallbackUsed ? I18nService.t(loc, 'media.fallbackNotice') : undefined;
            if (members.length <= 0) {
                await interaction.editReply({ content, embeds: [mangaEmbed] });
                return;
            }
            const scores = await scoresService.searchScores({ id: data.getId(), idMal: data.getMalId(), type: 'MANGA' }, members as any);
            const nobodyMsg = I18nService.t(loc, 'media.nobodyKnows');
            const scoresEmbed = scores.length > 0 ? new ScoresEmbed(scores, loc) : new ErrorEmbed(nobodyMsg);
            await interaction.editReply({ content, embeds: [mangaEmbed, scoresEmbed] });
            return;
        }

        AnimeValidator.validateName(args);
        const result = await mediaService.searchMangaByName(args);
        const media = result.data;
        if (!media || media.length <= 0) {
            const srv = result.provider === 'MAL' ? 'MyAnimeList' : 'AniList';
            throw new BusinessRuleError(I18nService.t(loc, 'api.notFound', { service: srv }));
        }

        const embeds = media.map(m => new MangaEmbed(m, loc));
        const scoresEmbeds: EmbedBuilder[] = [];
        const index = 0;
        const nobodyMsg = I18nService.t(loc, 'media.nobodyKnows');
        const mediaRefs = media.map(m => ({ id: m.getId(), idMal: m.getMalId(), type: 'MANGA' as const }));

        if (members.length <= 0) {
            scoresEmbeds[index] = new ErrorEmbed(nobodyMsg);
        } else {
            const scores = await scoresService.searchScores(mediaRefs[index], members as any);
            scoresEmbeds[index] = scores.length > 0 ? new ScoresEmbed(scores, loc) : new ErrorEmbed(nobodyMsg);
        }

        const cacheId = InteractionStateService.getInstance().set({
            members, embeds, media: mediaRefs, scores: scoresEmbeds, index,
        }, 180_000);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(`media-back-button_${cacheId}`).setLabel('←').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`media-next-button_${cacheId}`).setLabel('→').setStyle(ButtonStyle.Primary)
        );

        const content = result.fallbackUsed ? I18nService.t(loc, 'media.fallbackNotice') : undefined;
        await interaction.editReply({ content, embeds: [embeds[index], scoresEmbeds[index]], components: [row] });
    }
}
