import { ChatInputCommandInteraction, Collection } from "discord.js";
import Bot from "../extensions/bot.extension";
import GenericError from "../errors/genericError";
import cooldownMessages from "../static/cooldownMessages";

const execute = (interaction: ChatInputCommandInteraction) => {
    const bot = interaction.client as Bot;
    const command = bot.commands.get(interaction.commandName);
    if (!command) return;
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
            throw new GenericError(cooldownMessages(interaction.locale, expirationSeconds))
        };
    };

    timestamps?.set(interaction.user.id, now);
    setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);
};

const cooldownsHelper = {
    execute
};

export default cooldownsHelper;