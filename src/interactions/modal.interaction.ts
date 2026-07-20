import { MessageFlags, ModalSubmitInteraction } from "discord.js";
import responsesHelper from "../helpers/responses.helper";
import ErrorEmbed from "../embeds/errorEmbed";
import Bot from "../extensions/bot.extension";

export default {
    execute: async (interaction: ModalSubmitInteraction) => {
        try {
            const args = interaction.customId.split('_');
            const id = args[0];
            const bot = interaction.client as Bot;
            const modal = bot.modals.get(id);
            if (modal) {
                return await modal.execute(interaction);
            };
        } catch (error: any) {
            console.error(error);
            await responsesHelper.execute(interaction, [new ErrorEmbed(error.message)], { flags: [MessageFlags.Ephemeral] });
        };
    }
};