import { ButtonInteraction, MessageFlags } from 'discord.js';
import { IButtonHandler } from '../../discord/button.interface';
import { ErrorEmbed, ScoresEmbed } from '../../ui';
import { ApiClientFactory } from '../../../infrastructure/external-apis/api-client.factory';
import { InteractionStateService } from '../../../infrastructure/cache/interaction-state.service';
import { I18nService } from '../../../core/i18n/i18n.service';

export class MediaNextButton implements IButtonHandler {
    public readonly id = 'media-next-button';

    public async execute(interaction: ButtonInteraction, data: any): Promise<void> {
        const loc = interaction.locale;
        if (!data) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed(I18nService.t(loc, 'common.expiredInteraction'))],
            });
            return;
        }

        data.index = data.index + 1;
        if (data.index > data.embeds.length - 1) data.index = 0;

        if (!data.scores[data.index]) {
            const nobodyMsg = I18nService.t(loc, 'media.nobodyKnows');
            if (data.members.length <= 0) {
                data.scores[data.index] = new ErrorEmbed(nobodyMsg);
            } else {
                const service = ApiClientFactory.getCrossPlatformScoresService();
                const scores = await service.searchScores(data.media[data.index], data.members);
                data.scores[data.index] = scores.length > 0
                    ? new ScoresEmbed(scores, loc)
                    : new ErrorEmbed(nobodyMsg);
            }
        }

        const cacheId = interaction.customId.split('_')[1];
        InteractionStateService.getInstance().update(cacheId, data);
        await interaction.update({
            embeds: [data.embeds[data.index], data.scores[data.index]],
        });
    }
}

