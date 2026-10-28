import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, MessageFlags } from 'discord.js';
import crypto from 'crypto';
import { IButtonHandler } from '../../discord/button.interface';
import { ErrorEmbed, SetupInstructionsEmbed } from '../../ui';
import { InteractionStateService } from '../../../infrastructure/cache/interaction-state.service';
import { I18nService } from '../../../core/i18n/i18n.service';

export class SetupMalButton implements IButtonHandler {
    public readonly id = 'setup-mal-button';

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

        const cacheId = interaction.customId.split('_')[1] || member.key;
        const codeVerifier = crypto.randomBytes(32).toString('hex');
        member.code_verifier = codeVerifier;
        InteractionStateService.getInstance().update(cacheId, member, 120_000);

        const url = `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${process.env.MAL_CLIENT_ID}&state=${interaction.user.id}&code_challenge=${codeVerifier}&code_challenge_method=plain`;

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder({ style: ButtonStyle.Link, url, label: 'Autorizar' }),
            new ButtonBuilder({ style: ButtonStyle.Primary, customId: `setup-instructions-mal-button_${cacheId}`, label: 'Ingresar código' })
        );

        await interaction.reply({
            flags: [MessageFlags.Ephemeral],
            embeds: [new SetupInstructionsEmbed('MAL', loc)],
            components: [row],
        });
    }
}

