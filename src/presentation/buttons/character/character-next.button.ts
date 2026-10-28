import { ButtonInteraction, MessageFlags } from 'discord.js';
import { IButtonHandler } from '../../discord/button.interface';
import { ErrorEmbed } from '../../ui';
import { I18nService } from '../../../core/i18n/i18n.service';

export class CharacterNextButton implements IButtonHandler {
    public readonly id = 'character-next-button';

    public async execute(interaction: ButtonInteraction, data: any): Promise<void> {
        if (!data) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed(I18nService.t(interaction.locale, 'common.expiredInteraction'))],
            });
            return;
        }

        data.index = data.index + 1;
        if (data.index > data.cards.length - 1) data.index = 0;

        await interaction.update({
            flags: [MessageFlags.IsComponentsV2],
            components: [data.cards[data.index]],
        });
    }
}

