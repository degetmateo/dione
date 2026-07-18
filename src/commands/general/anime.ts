import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import GenericError from "../../errors/genericError";
import AnimeCommandInteraction from "../../command-interactions/anime/animeCommandInteraction";
import GuildChatInputCommandInteraction from "../../extensions/guildChatInputCommandInteraction.extension";

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('anime')
        .setNSFW(false)
        .setDescription('Search for an anime.')
        .setDescriptionLocalization('es-ES', 'Buscar un anime.')
        .setContexts(InteractionContextType.Guild)
        .addStringOption(options => 
            options
                .setName('name-or-id')
                .setNameLocalization('es-ES', 'nombre-o-id')
                .setDescription('Name or ID of the anime.')
                .setDescriptionLocalization('es-ES', 'Nombre o ID del anime.')
                .setRequired(true)
        ),
    execute: async (interaction: GuildChatInputCommandInteraction) => {
        try {
            await new AnimeCommandInteraction(interaction).execute();
        } catch (error) {
            console.error(error);
            if (error instanceof GenericError) throw error;
            else throw new GenericError();
        };
    }
};