import { ButtonInteraction, LabelBuilder, MessageFlags, ModalBuilder, TextDisplayBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { IButtonHandler } from '../../discord/button.interface';
import { ErrorEmbed } from '../../ui';
import { I18nService } from '../../../core/i18n/i18n.service';

export class GachaAuctionPushButton implements IButtonHandler {
    public readonly id = 'gacha-auction-push-button';

    public async execute(interaction: ButtonInteraction, data: any): Promise<void> {
        if (!data) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed(I18nService.t(interaction.locale, 'common.expiredInteraction'))],
            });
            return;
        }

        const cacheId = interaction.customId.split('_')[1];
        const form = new ModalBuilder()
            .setTitle(`¡Puja por ${data.character.name}!`)
            .setCustomId(`gacha-auction-push-modal_${cacheId}`)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `Estás a punto de pujar por este personaje. ` +
                    `Recuerda que una vez envíes este formulario, el anfitrión de la subasta podrá aceptar tu puja.\n\n` +
                    `Tu monto no debe ser inferior a \`$${data.base_price}\`.\n\n` +
                    `Ten en cuenta que si ya has hecho una puja, una nueva reemplazará a la anterior.`
                )
            )
            .addLabelComponents(
                new LabelBuilder()
                    .setLabel('Ingresa cuánto vas a pujar.')
                    .setTextInputComponent(
                        new TextInputBuilder()
                            .setPlaceholder('¡Escribe tu monto!')
                            .setRequired(true)
                            .setStyle(TextInputStyle.Short)
                            .setCustomId('gacha-auction-push-modal-input')
                    )
            );

        await interaction.showModal(form);
    }
}

