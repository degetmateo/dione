import { ButtonInteraction, MessageFlags } from 'discord.js';
import { IButtonHandler } from '../../discord/button.interface';
import { ErrorEmbed, VnScoresEmbed } from '../../ui';
import { ApiClientFactory } from '../../../infrastructure/external-apis/api-client.factory';
import { I18nService } from '../../../core/i18n/i18n.service';

export class VnBackButton implements IButtonHandler {
    public readonly id = 'vn-button-back';

    public async execute(interaction: ButtonInteraction, data: any): Promise<void> {
        const loc = interaction.locale;
        if (!data) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed(I18nService.t(loc, 'common.expiredInteraction'))],
            });
            return;
        }

        await interaction.deferUpdate();
        data.index = data.index - 1;
        if (data.index < 0) data.index = data.vnsEmbeds.length - 1;

        if (!data.scoresEmbeds[data.index]) {
            const vndb = ApiClientFactory.getVndbClient();
            const scores = await vndb.scores(data.users.map((user: any) => ({
                userId: user.vndb.id,
                username: user.vndb.username,
                userToken: user.vndb.auth.token,
                vnId: data.media[data.index].id,
            })));

            const noVotesMsg = I18nService.t(loc, 'media.noVotesVn');
            data.scoresEmbeds[data.index] = scores.length > 0
                ? new VnScoresEmbed(scores, loc)
                : new ErrorEmbed(noVotesMsg);
        }

        await interaction.editReply({
            embeds: [data.vnsEmbeds[data.index], data.scoresEmbeds[data.index]],
        });
    }
}

