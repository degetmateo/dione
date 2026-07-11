import { Collection, Events, Interaction, MessageFlags, ModalSubmitInteraction } from 'discord.js';
import Bot from '../extensions/bot';
import ErrorEmbed from '../embeds/errorEmbed';
import cooldownMessages from '../static/cooldownMessages';
import GenericError from '../errors/genericError';

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    execute: async (interaction: Interaction) => {
        try {
            const bot = interaction.client as Bot;

            if (!interaction.inGuild()) return;

            if (interaction.isButton()) {
                return await bot.buttons.get(interaction.customId)?.execute(interaction);
            };

            if (interaction.isModalSubmit()) {
                return await bot.modalsHandler.collection.get(interaction.customId).execute(interaction);
            };

            if (!interaction.isChatInputCommand()) return;

            const command = bot.commands.get(interaction.commandName);

            if (!command) {
                console.error(`🟥 | No command matching ${interaction.commandName} was found.`);
                throw new GenericError();
            };

            const cooldowns = bot.cooldowns;

            if (!cooldowns.has(command.data.name)) {
                cooldowns.set(command.data.name, new Collection());
            };

            const now = Date.now();
            const timestamps = cooldowns.get(command.data.name);
            const defaultCooldown = 3;
            const cooldownAmount = (command.cooldown ?? defaultCooldown) * 1000;

            if (timestamps?.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

                if (now < expirationTime) {
                    const expirationSeconds = ((expirationTime - now) / 1000).toFixed(0);

                    return await interaction.reply({
                        embeds: [new ErrorEmbed(cooldownMessages(interaction.locale, expirationSeconds))],
                        flags: [MessageFlags.Ephemeral]
                    });
                };
            };

            timestamps?.set(interaction.user.id, now);
            setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);

            await command.execute(interaction);
        } catch (error: any) {
            console.error(error);
            if (!interaction.isChatInputCommand()) return;

            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply({
                        embeds: [new ErrorEmbed(error.message)],
                        components: [],
                        content: null
                    });
                } else {
                    await interaction.reply({ 
                        embeds: [new ErrorEmbed(error.message)], 
                        flags: [MessageFlags.Ephemeral],
                        components: []
                    });
                };
            } catch (e: any) {
                console.error(e);
            };
        };
    }
};