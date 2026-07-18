import { InteractionContextType, MessageFlags, SlashCommandBuilder } from "discord.js";
import responsesHelper from "../../helpers/responses.helper";
import ErrorEmbed from "../../embeds/errorEmbed";
import mongo from "../../database/mongo";
import GenericError from "../../errors/genericError";
import SuccessEmbed from "../../embeds/successEmbed";
import GuildChatInputCommandInteraction from "../../extensions/guildChatInputCommandInteraction.extension";

const execute = async (interaction: GuildChatInputCommandInteraction) => {
    try {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const members = mongo.collection('members');
        const member = await members.findOneAndDelete({ discord_id: interaction.user.id });

        if (!member) throw new GenericError("No estás registrado.");

        await interaction.editReply({
            embeds: [new SuccessEmbed("Eliminé correctamente tu cuenta.")]
        });
    } catch (error: any) {
        console.error(error);
        await responsesHelper.execute(interaction, [new ErrorEmbed(error.message)], { flags: [MessageFlags.Ephemeral] });
    };
};

module.exports = {
    cooldown: 60,
    data: new SlashCommandBuilder()
        .setName('unsetup')
        .setDescription('Unsetup your account from the bot.')
        .setNSFW(false)
        .setContexts(InteractionContextType.Guild),
    execute: execute
};