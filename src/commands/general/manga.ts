import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import mangaExecute from "./execute/manga/manga.execute";

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
    execute: mangaExecute
};