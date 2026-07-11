import { ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from "discord.js";
import GenericError from "../../../errors/genericError";
import UserCommandInteraction from "../../../command-interactions/user/userCommandInteraction";

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('user')
        .setContexts(InteractionContextType.Guild)
        .setNSFW(false)
        .setDescription('User anilist information.')
        .setDescriptionLocalization('es-ES', 'Información de anilist de un usuario.')
        .setDescriptionLocalization('es-419', 'Información de anilist de un usuario.')
        .addUserOption(option => 
            option
                .setName('member')
                .setDescription('The user to get information for.')
                .setDescriptionLocalization('es-ES', 'El usuario del que obtener información.')
                .setDescriptionLocalization('es-419', 'El usuario del que obtener información.')
                .setRequired(false)),
    execute: async (interaction: ChatInputCommandInteraction) => {
        try {
            await new UserCommandInteraction(interaction).execute();
        } catch (error) {
            console.error(error);
            if (error instanceof GenericError) throw error;
            else throw new GenericError();
        };
    }
};