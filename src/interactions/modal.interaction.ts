import { MessageFlags, ModalSubmitInteraction } from "discord.js";
import responsesHelper from "../helpers/responses.helper";
import ErrorEmbed from "../embeds/errorEmbed";
import exchangeCreateModalExecute from "../modals/exchange.create.modal.execute";

export default {
    execute: async (interaction: ModalSubmitInteraction) => {
        try {
            const ids = interaction.customId.split('_');

            if (ids[0] === 'exchange-create-modal') {
                return await exchangeCreateModalExecute(interaction);
            };
        } catch (error: any) {
            console.error(error);
            await responsesHelper.execute(interaction, [new ErrorEmbed(error.message)], { flags: [MessageFlags.Ephemeral] });
        };
    }
};