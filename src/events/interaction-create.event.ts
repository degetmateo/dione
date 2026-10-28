import { Events, Interaction } from 'discord.js';
import Bot from '../bot/bot';
import { InteractionErrorHandler } from '../core/resilience/interaction-error-handler';

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    execute: async (interaction: Interaction) => {
        try {
            const bot = interaction.client as Bot;
            if (!interaction.inGuild()) return;

            if (interaction.isChatInputCommand()) {
                return await bot.commandDispatcher.dispatch(interaction);
            }

            if (interaction.isButton()) {
                return await bot.buttonDispatcher.dispatch(interaction);
            }

            if (interaction.isModalSubmit()) {
                return await bot.modalDispatcher.dispatch(interaction);
            }
        } catch (error: unknown) {
            await InteractionErrorHandler.handle(interaction, error);
        }
    },
};
