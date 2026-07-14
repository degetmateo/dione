import { MessageFlags } from "discord.js";
import Bot from "../extensions/bot";
import GenericError from "../errors/genericError";
import ErrorEmbed from "../embeds/errorEmbed";
import cooldownsHelper from "../helpers/cooldowns.helper";
import BChatInputCommandInteraction from "../extensions/interaction";
import responsesHelper from "../helpers/responses.helper";

export default {
    execute: async (interaction: BChatInputCommandInteraction) => {
        try {
            const command = interaction.client.commands.get(interaction.commandName);
            
            if (!command) {
                console.error(`🟥 | No command matching ${interaction.commandName} was found.`);
                throw new GenericError();
            };

            cooldownsHelper.execute(interaction);
            await command.execute(interaction);
        } catch (error: any) {
            console.error(error);
            await responsesHelper.execute(interaction, [new ErrorEmbed(error.message)], { flags: [MessageFlags.Ephemeral] });
        }
    }
};