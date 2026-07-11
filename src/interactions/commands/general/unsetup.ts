import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import BChatInputCommandInteraction from "../../../extensions/interaction";
import GenericError from "../../../errors/genericError";
import UnsetupCommandInteraction from "../../../command-interactions/unsetup/unsetupCommandInteraction";

module.exports = {
    cooldown: 60,
    data: new SlashCommandBuilder()
        .setName('unsetup')
        .setDescription('Unsetup your account from the bot.')
        .setNSFW(false)
        .setContexts(InteractionContextType.Guild),
    execute: async (interaction: BChatInputCommandInteraction) => {
        try {
            await new UnsetupCommandInteraction(interaction).execute();
        } catch (error) {
            console.error(error);
            if (error instanceof GenericError) throw error;
            else throw new GenericError();
        };
    }
};