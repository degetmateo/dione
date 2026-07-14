import { Events, Interaction } from 'discord.js';
import chatInputCommandInteraction from '../interactions/chatInputCommand.interaction';
import BChatInputCommandInteraction from '../extensions/interaction';

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    execute: async (interaction: Interaction) => {
        try {
            if (!interaction.inGuild()) return;

            if (interaction.isChatInputCommand()) {
                return chatInputCommandInteraction.execute(interaction as BChatInputCommandInteraction);
            };
        } catch (error) {
            console.error(error);
        };
    }
};