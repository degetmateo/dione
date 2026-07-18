import { ButtonInteraction, MessageFlags } from "discord.js";
import responsesHelper from "../helpers/responses.helper";
import ErrorEmbed from "../embeds/errorEmbed";
import exchangeCreateButtonAccept from "../buttons/exchange.create.button.accept";
import exchangeCreateButtonFinishExecute from "../buttons/exchange.create.button.finish";
import exchangeCancelButton from "../buttons/exchange.cancel.button";
import exchangeCompleteButton from "../buttons/exchange.complete.button";

export default {
    execute: async (interaction: ButtonInteraction) => {
        try {
            const ids = interaction.customId.split('_');

            if (ids[0] === 'exch-create-btn-accept') {
                return await exchangeCreateButtonAccept(interaction);
            };

            if (ids[0] === 'exchange-create-button-finish') {
                return await exchangeCreateButtonFinishExecute(interaction);
            };

            if (ids[0] === 'exchange-cancel-button') {
                return await exchangeCancelButton(interaction);
            };

            if (ids[0] === 'exchange-complete-button-confirm') {
                return await exchangeCompleteButton(interaction);
            }
        } catch (error: any) {
            console.error(error);
            await responsesHelper.execute(interaction, [new ErrorEmbed(error.message)], { flags: [MessageFlags.Ephemeral] });
        };
    }
};