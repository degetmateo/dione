import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import animeExecute from "./execute/anime/anime.execute";

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
    execute: animeExecute
};