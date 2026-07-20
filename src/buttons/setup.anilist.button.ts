import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, MessageFlags } from "discord.js";
import Bot from "../extensions/bot.extension";
import ErrorEmbed from "../embeds/errorEmbed";
import SetupInstructionsEmbed from "../builders/embeds/setupInstructions.embed";
import { ANILIST_AUTH_URL } from "../consts";

module.exports = {
    id: 'setup-anilist-button',
    execute: async (interaction: ButtonInteraction) => {
        const bot = interaction.client as Bot;
        const values = interaction.customId.split('_');
        const key = values[1];
        const member = bot.get(key);

        if (!member) {
            return await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed('Esta interacción ha expirado.')]
            });
        };

        if (interaction.user.id != member.discord_id) {
            return await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed('No tienes permiso para realizar esta acción.')]
            });
        };

        const cacheID = bot.set(member, 300_000);

        const row = new ActionRowBuilder<ButtonBuilder>();

        row.addComponents([
            new ButtonBuilder({
                style: ButtonStyle.Link,
                url: ANILIST_AUTH_URL,
                label: 'Autorizar'
            }),
            new ButtonBuilder({
                style: ButtonStyle.Primary,
                customId: `setup-instructions-anilist-button_${cacheID}`,
                label: 'Ingresar código',
            })
        ]);

        await interaction.reply({
            flags: [MessageFlags.Ephemeral],
            embeds: [new SetupInstructionsEmbed()],
            components: [row]
        });
    }
};