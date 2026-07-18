import { Events, Interaction } from 'discord.js';
import chatInputCommandInteraction from '../interactions/chatInputCommand.interaction';
import GuildChatInputCommandInteraction from '../extensions/guildChatInputCommandInteraction.extension';

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    execute: async (interaction: Interaction) => {
        try {
            if (!interaction.inGuild()) return;

            if (interaction.isChatInputCommand()) {
                return chatInputCommandInteraction.execute(interaction as GuildChatInputCommandInteraction);
            };
        } catch (error) {
            console.error(error);
        };
    }
};