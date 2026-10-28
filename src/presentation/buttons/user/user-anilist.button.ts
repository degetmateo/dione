import { ButtonInteraction } from 'discord.js';
import { IButtonHandler } from '../../discord/button.interface';
import { ErrorEmbed, UserAnilistEmbed, UserRowComponent } from '../../ui';
import { ApiClientFactory } from '../../../infrastructure/external-apis/api-client.factory';
import { InteractionStateService } from '../../../infrastructure/cache/interaction-state.service';
import { I18nService } from '../../../core/i18n/i18n.service';

export class UserAnilistButton implements IButtonHandler {
    public readonly id = 'user-anilist-button';

    public async execute(interaction: ButtonInteraction, data: any): Promise<void> {
        if (!data) {
            await interaction.reply({
                flags: 'Ephemeral',
                embeds: [new ErrorEmbed(I18nService.t(interaction.locale, 'common.expiredInteraction'))],
            });
            return;
        }

        if (!data.embeds['anilist']) {
            const anilist = ApiClientFactory.getAniListClient();
            const aniuser = await anilist.authorized.get.user(data.member.anilist.id, data.member.anilist.token);
            data.embeds['anilist'] = new UserAnilistEmbed(aniuser);
        }

        const cacheId = interaction.customId.split('_')[1];
        InteractionStateService.getInstance().update(cacheId, data, 120_000);

        const buttons = new UserRowComponent({
            id: cacheId,
            anilist: false,
            mal: data.member.mal,
            vndb: data.member.vndb,
            profile: true,
        });

        await interaction.update({
            embeds: [data.embeds['anilist']],
            components: buttons.isValid() ? [buttons] : [],
        });
    }
}

