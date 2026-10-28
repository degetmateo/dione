import { ButtonInteraction, LabelBuilder, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { IButtonHandler } from '../../discord/button.interface';
import { ErrorEmbed } from '../../ui';
import { InteractionStateService } from '../../../infrastructure/cache/interaction-state.service';
import { I18nService } from '../../../core/i18n/i18n.service';

export class SetupInstructionsAnilistButton implements IButtonHandler {
    public readonly id = 'setup-instructions-anilist-button';

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

        const cacheID = InteractionStateService.getInstance().set(member, 120_000);
        const modal = new ModalBuilder()
            .setCustomId(`setup-instructions-anilist-modal_${cacheID}`)
            .setTitle('Formulario para autentificarte.');

        const input = new TextInputBuilder()
            .setCustomId('setup-instructions-anilist-input')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Pegá tu código acá...')
            .setRequired(true);

        const label = new LabelBuilder({ label: 'Ingresá tu código.' }).setTextInputComponent(input);
        modal.addLabelComponents(label);
        await interaction.showModal(modal);
    }
}

