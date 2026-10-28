import { ButtonInteraction } from 'discord.js';
import { IButtonHandler } from '../../discord/button.interface';
import { ErrorEmbed, UserMalEmbed, UserRowComponent } from '../../ui';
import { ApiClientFactory } from '../../../infrastructure/external-apis/api-client.factory';
import { InteractionStateService } from '../../../infrastructure/cache/interaction-state.service';
import { I18nService } from '../../../core/i18n/i18n.service';

export class UserMalButton implements IButtonHandler {
    public readonly id = 'user-mal-button';

    public async execute(interaction: ButtonInteraction, data: any): Promise<void> {
        if (!data) {
            await interaction.reply({
                flags: 'Ephemeral',
                embeds: [new ErrorEmbed(I18nService.t(interaction.locale, 'common.expiredInteraction'))],
            });
            return;
        }

        if (!data.embeds['mal']) {
            const mal = ApiClientFactory.getMalClient();
            const maluser: any = await mal.user.get({
                id: data.member.mal.id,
                token: data.member.mal.auth.access_token,
                discordId: data.member._id,
                auth: data.member.mal.auth,
            });
            if (data.member.profile) {
                maluser.color = data.member.profile.color;
            }
            data.embeds['mal'] = new UserMalEmbed(maluser);
        }

        const cacheId = interaction.customId.split('_')[1];
        InteractionStateService.getInstance().update(cacheId, data, 120_000);

        const buttons = new UserRowComponent({
            id: cacheId,
            anilist: data.member.anilist,
            mal: false,
            vndb: data.member.vndb,
            profile: true,
        });

        await interaction.update({
            embeds: [data.embeds['mal']],
            components: buttons.isValid() ? [buttons] : [],
        });
    }
}

