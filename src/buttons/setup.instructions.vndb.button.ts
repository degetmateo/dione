import { ButtonInteraction, LabelBuilder, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ObjectId } from "mongodb";
import Bot from "../extensions/bot.extension";
import ErrorEmbed from "../embeds/errorEmbed";

module.exports = {
    id: 'setup-instructions-vndb-button',
    execute: async (interaction: ButtonInteraction, member: {
        _id: ObjectId;
        discord_id: string;
        key: string;
    }) => {
        const bot = interaction.client as Bot;

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

        bot.update(member.key, member, 60_000);

        const modal = new ModalBuilder();
        modal.setCustomId(`setup-instructions-vndb-modal_${member.key}`) 
        modal.setTitle('Formulario de VNDB.');

        const input = new TextInputBuilder()
            .setCustomId('setup-instructions-vndb-input') 
            .setStyle(TextInputStyle.Paragraph) 
            .setPlaceholder('Pegá tu token acá...')
            .setRequired(true); 

        const label = new LabelBuilder({
            label: 'Ingresá tu token.'
        }).setTextInputComponent(input);

        modal.addLabelComponents(label);

        await interaction.showModal(modal);
    }
};