import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import BChatInputCommandInteraction from "../../../extensions/interaction";
import GenericError from "../../../errors/genericError";
import ShowScoresCommandInteraction from "../../../command-interactions/show-scores/showScoresCommandInteraction";

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('show-scores')
        .setDescription('Show your scores for each anime being displayed in this server.')
        .setNSFW(false)
        .setContexts(InteractionContextType.Guild)
        .addBooleanOption(option => {
            return option
                .setName('enabled')
                .setDescription('If you want this feature to be enabled for you in this server.')
                .setRequired(true)
        }),
    execute: async (interaction: BChatInputCommandInteraction) => {
        try {
            await new ShowScoresCommandInteraction(interaction).execute();
        } catch (error) {
            console.error(error);
            if (error instanceof GenericError) throw error;
            else throw new GenericError();
        };
    }
};