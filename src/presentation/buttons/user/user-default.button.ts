import { ButtonInteraction } from 'discord.js';
import { IButtonHandler } from '../../discord/button.interface';
import { ErrorEmbed, UserProfileEmbed, UserRowComponent } from '../../ui';
import { InteractionStateService } from '../../../infrastructure/cache/interaction-state.service';
import { I18nService } from '../../../core/i18n/i18n.service';

export class UserDefaultButton implements IButtonHandler {
    public readonly id = 'user-default-button';

    public async execute(interaction: ButtonInteraction, data: any): Promise<void> {
        if (!data) {
            await interaction.reply({
                flags: 'Ephemeral',
                embeds: [new ErrorEmbed(I18nService.t(interaction.locale, 'common.expiredInteraction'))],
            });
            return;
        }

        const profileEmbed = data.embeds['profile'] || data.embeds['default'] || new UserProfileEmbed({ member: data.member, user: data.user });
        data.embeds['profile'] = profileEmbed;
        data.embeds['default'] = profileEmbed;

        const cacheId = interaction.customId.split('_')[1];
        InteractionStateService.getInstance().update(cacheId, data, 120_000);

        const buttons = new UserRowComponent({
            id: cacheId,
            anilist: data.member.anilist,
            mal: data.member.mal,
            vndb: data.member.vndb,
            profile: false,
        });

        await interaction.update({
            embeds: [profileEmbed],
            components: buttons.isValid() ? [buttons] : [],
        });
    }
}

