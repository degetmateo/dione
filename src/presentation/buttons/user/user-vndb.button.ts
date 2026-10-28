import { ButtonInteraction } from 'discord.js';
import { IButtonHandler } from '../../discord/button.interface';
import { ErrorEmbed, UserRowComponent, UserVndbEmbed } from '../../ui';
import { ApiClientFactory } from '../../../infrastructure/external-apis/api-client.factory';
import { InteractionStateService } from '../../../infrastructure/cache/interaction-state.service';
import { I18nService } from '../../../core/i18n/i18n.service';

export class UserVndbButton implements IButtonHandler {
    public readonly id = 'user-vndb-button';

    public async execute(interaction: ButtonInteraction, data: any): Promise<void> {
        if (!data) {
            await interaction.reply({
                flags: 'Ephemeral',
                embeds: [new ErrorEmbed(I18nService.t(interaction.locale, 'common.expiredInteraction'))],
            });
            return;
        }

        if (!data.embeds['vndb']) {
            const vndb = ApiClientFactory.getVndbClient();
            const vndbuser: any = await vndb.user({ id: data.member.vndb.id, token: data.member.vndb.auth.token });
            vndbuser.name = data.member.vndb.username;
            vndbuser.id = data.member.vndb.id;

            if (data.member.profile) {
                vndbuser.color = data.member.profile.color;
                vndbuser.avatar = data.member.profile.avatar_url;
                vndbuser.banner = data.member.profile.banner_url;
            }

            data.embeds['vndb'] = new UserVndbEmbed(vndbuser);
        }

        const cacheId = interaction.customId.split('_')[1];
        InteractionStateService.getInstance().update(cacheId, data, 120_000);

        const buttons = new UserRowComponent({
            id: cacheId,
            anilist: data.member.anilist,
            mal: data.member.mal,
            vndb: false,
            profile: true,
        });

        await interaction.update({
            embeds: [data.embeds['vndb']],
            components: buttons.isValid() ? [buttons] : [],
        });
    }
}

