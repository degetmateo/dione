import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import BChatInputCommandInteraction from "../../../extensions/interaction";
import HelpCommandInteraction from "../../../command-interactions/help/helpCommandInteraction";
import GenericError from "../../../errors/genericError";

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all the commands.')
        .setDescriptionLocalization('es-ES', 'Envía todos los comandos.')
        .setDescriptionLocalization('es-419', 'Envía todos los comandos.')
        .setContexts(InteractionContextType.Guild)
        .setNSFW(false),
    execute: async (interaction: BChatInputCommandInteraction) => {
        try {
            await new HelpCommandInteraction(interaction).execute();
        } catch (error) {
            console.error(error);
            if (error instanceof GenericError) throw error;
            else throw new GenericError();
        };
    }
};