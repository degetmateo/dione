import { InteractionContextType, MessageFlags, SlashCommandBuilder } from "discord.js";
import HelpEmbed from "../../embeds/helpEmbed";
import GuildChatInputCommandInteraction from "../../extensions/guildChatInputCommandInteraction.extension";

const execute = async (interaction: GuildChatInputCommandInteraction) => {
    await interaction.reply({
        embeds: [new HelpEmbed()],
        flags: [MessageFlags.Ephemeral]
    });
};

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all the commands.')
        .setDescriptionLocalization('es-ES', 'Envía todos los comandos.')
        .setDescriptionLocalization('es-419', 'Envía todos los comandos.')
        .setContexts(InteractionContextType.Guild)
        .setNSFW(false),
    execute: execute
};