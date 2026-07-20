import { ButtonInteraction, LabelBuilder, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import Bot from "../extensions/bot.extension";
import ErrorEmbed from "../embeds/errorEmbed";

module.exports = {
    id: 'setup-instructions-anilist-button',
    execute: async (interaction: ButtonInteraction) => {
        const bot = interaction.client as Bot;
        const values = interaction.customId.split('_');
        const key = values[1];
        const member = bot.get(key);

        if (!member) {
            return await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed('Esta interacción ha expirado.')]
            });
        };

        if (interaction.user.id != member.discord_id) {
            return await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed('No tienes permiso para realizar esta acción.')]
            });
        };

        const cacheID = bot.set(member, 120_000);
        const modal = new ModalBuilder();
        modal.setCustomId(`setup-instructions-anilist-modal_${cacheID}`) 
        modal.setTitle('Formulario para autentificarte.');

        const input = new TextInputBuilder()
            .setCustomId('setup-instructions-anilist-input') 
            .setStyle(TextInputStyle.Paragraph) 
            .setPlaceholder('Pegá tu código acá...')
            .setRequired(true); 

        const label = new LabelBuilder({
            label: 'Ingresá tu código.'
        }).setTextInputComponent(input);

        modal.addLabelComponents(label);

        await interaction.showModal(modal);
    }
};