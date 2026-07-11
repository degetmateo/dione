import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import BChatInputCommandInteraction from "../../../extensions/interaction";
import GenericError from "../../../errors/genericError";
import AffinityCommandInteraction from "../../../command-interactions/affinity/affinityCommandInteraction";

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('affinity')
        .setDescription('Your affinity with another user!')
        .setDescriptionLocalization('es-ES', '¡Tu afinidad con otro usuario!')
        .setDescriptionLocalization('es-419', '¡Tu afinidad con otro usuario!')
        .setContexts(InteractionContextType.Guild)
        .setNSFW(false)
        .addUserOption(option => {
            return option
                .setName('member')
                .setDescription('The member you want your affinity with.')
                .setRequired(true)
        }),
    execute: async (interaction: BChatInputCommandInteraction) => {
        try {
            await new AffinityCommandInteraction(interaction).execute();
        } catch (error) {
            console.error(error);
            if (error instanceof GenericError) throw error;
            else throw new GenericError();
        };
    }
};