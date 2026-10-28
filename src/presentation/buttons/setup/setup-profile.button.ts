import { ButtonInteraction, LabelBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { IButtonHandler } from '../../discord/button.interface';
import { ErrorEmbed } from '../../ui';
import { I18nService } from '../../../core/i18n/i18n.service';

export class SetupProfileButton implements IButtonHandler {
    public readonly id = 'setup-profile-button';

    public async execute(interaction: ButtonInteraction, data: any): Promise<void> {
        if (!data) {
            await interaction.reply({
                flags: 'Ephemeral',
                embeds: [new ErrorEmbed(I18nService.t(interaction.locale, 'common.expiredInteraction'))],
            });
            return;
        }

        const cacheId = interaction.customId.split('_')[1];
        const modal = new ModalBuilder()
            .setCustomId(`setup-profile-modal_${cacheId}`)
            .setTitle('¡Customiza tu perfil!')
            .addLabelComponents(
                new LabelBuilder()
                    .setLabel('Modifica el color de tu perfil.')
                    .setDescription('El color que ingreses debe estar en formato hexadecimal.')
                    .setTextInputComponent(
                        new TextInputBuilder()
                            .setCustomId('setup-profile-modal-input-color')
                            .setPlaceholder('Tu código hexadecimal...')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(false)
                            .setValue(data.profile ? data.profile.color || '' : '')
                    ),
                new LabelBuilder()
                    .setLabel('Avatar de perfil.')
                    .setDescription('URL de una imagen que usaremos como tu avatar de perfil.')
                    .setTextInputComponent(
                        new TextInputBuilder()
                            .setCustomId('setup-profile-modal-input-avatar-url')
                            .setRequired(false)
                            .setPlaceholder('Enlace de tu avatar...')
                            .setStyle(TextInputStyle.Short)
                            .setValue(data.profile ? data.profile.avatar_url || '' : '')
                    ),
                new LabelBuilder()
                    .setLabel('Banner de perfil.')
                    .setDescription('URL de una imagen que usaremos como tu banner de perfil.')
                    .setTextInputComponent(
                        new TextInputBuilder()
                            .setCustomId('setup-profile-modal-input-banner-url')
                            .setRequired(false)
                            .setPlaceholder('Enlace de tu banner...')
                            .setStyle(TextInputStyle.Short)
                            .setValue(data.profile ? data.profile.banner_url || '' : '')
                    )
            );

        await interaction.showModal(modal);
    }
}

