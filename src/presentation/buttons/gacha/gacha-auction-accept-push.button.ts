import { ButtonInteraction, MessageFlags, TextDisplayBuilder } from 'discord.js';
import { IButtonHandler } from '../../discord/button.interface';
import { ErrorEmbed } from '../../ui';
import { BusinessRuleError } from '../../../core/errors';

export class GachaAuctionAcceptPushButton implements IButtonHandler {
    public readonly id = 'gacha-auction-accept-push-button';

    public async execute(interaction: ButtonInteraction, data: any): Promise<void> {
        if (!data) return;

        if (interaction.user.id !== data.characterUserId) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed('¡No eres el anfitrión de esta subasta!')],
            });
            return;
        }

        const pushUserId = interaction.customId.split('_')[2];
        const push = data.users.get(pushUserId);

        if (!push) throw new BusinessRuleError('Ha ocurrido un error con la puja seleccionada.');

        await interaction.reply({
            flags: [MessageFlags.IsComponentsV2],
            components: [
                new TextDisplayBuilder().setContent(`Has aceptado la puja de <@${pushUserId}> por \`$${push}\` renas.`),
            ],
        });
    }
}

