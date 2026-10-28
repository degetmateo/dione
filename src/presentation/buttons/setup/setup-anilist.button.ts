import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, MessageFlags } from 'discord.js';
import { IButtonHandler } from '../../discord/button.interface';
import { ErrorEmbed, SetupInstructionsEmbed } from '../../ui';
import { ANILIST_AUTH_URL } from '../../../consts';
import { InteractionStateService } from '../../../infrastructure/cache/interaction-state.service';
import { I18nService } from '../../../core/i18n/i18n.service';

export class SetupAnilistButton implements IButtonHandler {
    public readonly id = 'setup-anilist-button';

    public async execute(interaction: ButtonInteraction, member: any): Promise<void> {
        const loc = interaction.locale;
        if (!member) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed(I18nService.t(loc, 'common.expiredInteraction'))],
            });
            return;
        }

        if (interaction.user.id !== member._id) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed(I18nService.t(loc, 'common.unauthorized'))],
            });
            return;
        }

        const cacheID = InteractionStateService.getInstance().set(member, 300_000);
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder({ style: ButtonStyle.Link, url: ANILIST_AUTH_URL, label: 'Autorizar' }),
            new ButtonBuilder({ style: ButtonStyle.Primary, customId: `setup-instructions-anilist-button_${cacheID}`, label: 'Ingresar código' }),
        ]);

        await interaction.reply({
            flags: [MessageFlags.Ephemeral],
            embeds: [new SetupInstructionsEmbed('ANILIST', loc)],
            components: [row],
        });
    }
}

