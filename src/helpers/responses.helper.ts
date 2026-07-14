import { ChatInputCommandInteraction, EmbedBuilder, Interaction, InteractionReplyOptions } from "discord.js";
import ErrorEmbed from "../embeds/errorEmbed";

const ok = async (interaction: Interaction, options: InteractionReplyOptions) => {
     try {
        if (!interaction.isRepliable()) return;
        
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ embeds: options.embeds, options });
        } else {
            await interaction.reply(options);
        };
    } catch (e: any) {
        console.error(e);
    };   
};

const error = async (interaction: ChatInputCommandInteraction, error: any) => {

};

const execute = async (interaction: Interaction, embeds: EmbedBuilder[], options?: InteractionReplyOptions) => {
    try {
        if (!interaction.isRepliable()) return;
        
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({
                embeds: embeds
            });
        } else {
            await interaction.reply({
                embeds,
                options
            });
        };
    } catch (e1: any) {
        console.error(e1);

        try {
            if (interaction.channel?.isSendable()) {
                await interaction.channel.send({
                    embeds: [new ErrorEmbed('Ocurrió un error inesperado.')]
                });
            };            
        } catch (e2: any) {
            console.error(e2)   
        };
    };
};

const responsesHelper = {
    ok,
    error,
    execute
};

export default responsesHelper;