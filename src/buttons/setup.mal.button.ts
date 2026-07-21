import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Colors, EmbedBuilder, MessageFlags } from "discord.js";
import { ObjectId } from "mongodb";
import crypto from 'crypto';
import ErrorEmbed from "../embeds/errorEmbed";
import Bot from "../extensions/bot.extension";

module.exports = {
    id: 'setup-mal-button',
    execute: async (interaction: ButtonInteraction, member: {
        _id: ObjectId;
        discord_id: string;
        key: string;
        code_verifier: string;
    }) => {
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

        const embed = new EmbedBuilder();
        embed.setColor(Colors.Orange);
        embed.setDescription(
            `**Instrucciones para vincular MAL**\n\n`+
            `▸ Presiona el botón que dice **Autorizar**.\n`+
            `▸ Inicia sesión y autoriza la aplicación en MAL. Luego, se te redirigirá a otra página.\n`+
            `▸ Verás un código en tu pantalla. Debes copiarlo.\n`+
            `▸ Vuelves aquí y presionas el botón **Ingresar código**. Pegas el código en el formulario y lo envias.`
        );
        embed.setFooter({ text: 'No compartas tus códigos con nadie.' });

        const code_verifier = crypto.randomBytes(32).toString('hex');
        const bot = interaction.client as Bot;
        member.code_verifier = code_verifier;
        bot.update(member.key, member, 120_000);

        const URL = 
            `https://myanimelist.net/v1/oauth2/authorize?`+
            `response_type=code&`+
            `client_id=${process.env.MAL_CLIENT_ID}&`+
            `state=${interaction.user.id}&`+
            `code_challenge=${code_verifier}&`+
            `code_challenge_method=plain`;

        const row = new ActionRowBuilder<ButtonBuilder>();
        row.addComponents(
            new ButtonBuilder({
                style: ButtonStyle.Link,
                url: URL,
                label: 'Autorizar'
            }),
            new ButtonBuilder({
                style: ButtonStyle.Primary,
                customId: `setup-instructions-mal-button_${member.key}`,
                label: 'Ingresar código',
            })
        );

        await interaction.reply({
            flags: [MessageFlags.Ephemeral],
            embeds: [embed],
            components: [row]
        });
    }
};