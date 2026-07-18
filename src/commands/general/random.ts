import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import GenericError from "../../errors/genericError";
import RandomCommandInteraction from "../../command-interactions/random/randomCommandInteraction";
import GuildChatInputCommandInteraction from "../../extensions/guildChatInputCommandInteraction.extension";

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Get a ramdom anime or manga recomendation from your PTW list.')
        .setNSFW(false)
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option => {
            return option
                .setName('type')
                .setDescription('Anime or manga.')
                .setRequired(true)
                .addChoices(
                    { name: 'Anime', value: 'ANIME' },
                    { name: 'Manga', value: 'MANGA' }
                )
        }),
    execute: async (interaction: GuildChatInputCommandInteraction) => {
        try {
            await new RandomCommandInteraction(interaction).execute();
        } catch (error) {
            console.error(error);
            if (error instanceof GenericError) throw error;
            else throw new GenericError();
        };
    }
};