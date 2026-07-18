import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import GenericError from "../../errors/genericError";
import VNCommandInteraction from "../../command-interactions/vn/vnCommandInteraction";
import GuildChatInputCommandInteraction from "../../extensions/guildChatInputCommandInteraction.extension";

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('vn')
        .setDescription('Search a Visual Novel on VNDB.')
        .setContexts(InteractionContextType.Guild)
        .setNSFW(false)
        .addStringOption(option => {
            return option
                .setName('name-or-id')
                .setDescription('Name or ID of the Visual Novel.')
                .setRequired(true)
        }),
    execute: async (interaction: GuildChatInputCommandInteraction) => {
        try {
            await new VNCommandInteraction(interaction).execute();
        } catch (error) {
            console.error(error);
            if (error instanceof GenericError) throw error;
            else throw new GenericError();
        };
    }
};