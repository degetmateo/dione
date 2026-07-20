import { ButtonInteraction, MessageFlags } from "discord.js";
import responsesHelper from "../helpers/responses.helper";
import ErrorEmbed from "../embeds/errorEmbed";
import Bot from "../extensions/bot.extension";

export default {
    execute: async (interaction: ButtonInteraction) => {
        try {
            const args = interaction.customId.split('_');
            const id = args[0];
            const bot = interaction.client as Bot;
            const button = bot.buttons.get(id);
            const cache = args[1];
            const data = cache ? bot.get(cache) : null;
            if (button) {
                return await button.execute(interaction, data);
            };
        } catch (error: any) {
            console.error(error);
            await responsesHelper.execute(interaction, [new ErrorEmbed(error.message)], { flags: [MessageFlags.Ephemeral] });
        };
    }
};