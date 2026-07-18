import { Events, Interaction } from 'discord.js';
import chatInputCommandInteraction from '../interactions/chatInputCommand.interaction';
import GuildChatInputCommandInteraction from '../extensions/guildChatInputCommandInteraction.extension';
import buttonInteraction from '../interactions/button.interaction';
import modalInteraction from '../interactions/modal.interaction';

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    execute: async (interaction: Interaction) => {
        try {
            if (!interaction.inGuild()) return;

            if (interaction.isChatInputCommand()) {
                return await chatInputCommandInteraction.execute(interaction as GuildChatInputCommandInteraction);
            };

            if (interaction.isButton()) {
                return await buttonInteraction.execute(interaction);
            };

            if (interaction.isModalSubmit()) {
                return await modalInteraction.execute(interaction);
            };
        } catch (error) {
            console.error(error);
        };
    }
};