import { InteractionContextType, MessageFlags, SlashCommandBuilder } from "discord.js";
import BChatInputCommandInteraction from "../../../extensions/interaction";
import HelpEmbed from "../../../embeds/helpEmbed";

const execute = async (interaction: BChatInputCommandInteraction) => {
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