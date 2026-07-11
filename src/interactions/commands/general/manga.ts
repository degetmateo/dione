import { ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from "discord.js";
import GenericError from "../../../errors/genericError";
import MangaCommandInteraction from "../../../command-interactions/manga/mangaCommandInteraction";
import BChatInputCommandInteraction from "../../../extensions/interaction";

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('manga')
        .setNSFW(false)
        .setDescription('Search for a manga.')
        .setDescriptionLocalization('es-ES', 'Buscar un manga.')
        .setContexts(InteractionContextType.Guild)
        .addStringOption(options => 
            options
                .setName('name-or-id')
                .setNameLocalization('es-ES', 'nombre-o-id')
                .setDescription('Name or ID of the manga.')
                .setDescriptionLocalization('es-ES', 'Nombre o ID del manga.')
                .setRequired(true)
        ),
    execute: async (interaction: BChatInputCommandInteraction) => {
        try {
            await new MangaCommandInteraction(interaction).execute();
        } catch (error) {
            console.error(error);

            if (error instanceof GenericError) throw error;
            else {
                throw new GenericError();
            };
        };
    }
};