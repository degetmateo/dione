import { ButtonInteraction, MessageFlags } from "discord.js";
import mongo from "../database/mongo";
import ErrorEmbed from "../embeds/errorEmbed";
import SuccessEmbed from "../embeds/successEmbed";

module.exports = {
    id: 'unsetup-button',
    execute: async (interaction: ButtonInteraction) => {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const members = mongo.collection('members');
        const member = await members.findOneAndDelete({ discord_id: interaction.user.id });

        if (!member) {
            return await interaction.editReply({
                embeds: [new ErrorEmbed('¡No estás registrado!')]
            });
        };

        await interaction.editReply({
            embeds: [new SuccessEmbed('Eliminé todos los datos de tu perfil correctamente.')]
        });
    }
};