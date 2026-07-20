import { MessageFlags, ModalSubmitInteraction } from "discord.js";
import Bot from "../extensions/bot.extension";
import mongo from "../database/mongo";
import ErrorEmbed from "../embeds/errorEmbed";
import SetupSuccessEmbed from "../builders/embeds/setupSuccess.embed";
import anilist from "../apis/anilist/anilist";

module.exports = {
    id: 'setup-instructions-anilist-modal',
    execute: async (interaction: ModalSubmitInteraction) => {
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

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const token = interaction.fields.getTextInputValue('setup-instructions-anilist-input');
        const viewer = await anilist.viewer(token);
    
        const members = mongo.collection('members');

        const query = await members.findOneAndUpdate(
            { _id: member._id },
            { $set: { anilist: { id: viewer.id, token: token } } }
        );
    
        if (!query) {
            return await interaction.editReply({
                embeds: [new ErrorEmbed('No hemos encontrado tu perfil.')]
            });
        };
    
        member.caches.forEach((c: string) => bot.delete(c));

        await interaction.editReply({
            embeds: [new SetupSuccessEmbed(viewer.name, viewer.siteUrl)]
        });
    }
};