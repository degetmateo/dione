import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, InteractionContextType, MessageFlags, SlashCommandBuilder } from "discord.js";
import responsesHelper from "../../helpers/responses.helper";
import ErrorEmbed from "../../embeds/errorEmbed";
import GuildChatInputCommandInteraction from "../../extensions/guildChatInputCommandInteraction.extension";

const execute = async (interaction: GuildChatInputCommandInteraction) => {
    try {
        const embed = new EmbedBuilder();
        
        embed.setDescription(`Estás a punto de eliminar completamente tu perfil de \`Dione\`. **Esto supondrá la pérdida de todos los datos que tienes en el bot**. ¿Estás seguro de que quieres hacer esto?`);
        embed.setColor(Colors.DarkRed);

        const id = interaction.client.set({}, 60_000);

        const row = new ActionRowBuilder<ButtonBuilder>();
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`unsetup-button_${id}`)
                .setLabel('Eliminar mi perfil')
                .setStyle(ButtonStyle.Danger)
        );

        return await interaction.reply({
            flags: [MessageFlags.Ephemeral],
            embeds: [embed],
            components: [row]
        });
    } catch (error: any) {
        console.error(error);
        await responsesHelper.execute(interaction, [new ErrorEmbed(error.message)], { flags: [MessageFlags.Ephemeral] });
    };
};

module.exports = {
    cooldown: 60,
    data: new SlashCommandBuilder()
        .setName('unsetup')
        .setDescription('Eliminar tu perfil del bot.')
        .setNSFW(false)
        .setContexts(InteractionContextType.Guild),
    execute: execute
};