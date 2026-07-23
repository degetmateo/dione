import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Colors, EmbedBuilder, MessageFlags } from "discord.js";
import { ObjectId } from "mongodb";
import ErrorEmbed from "../embeds/errorEmbed";
import Bot from "../extensions/bot.extension";

module.exports = {
    id: 'setup-vndb-button',
    execute: async (interaction: ButtonInteraction, member: {
        _id: ObjectId;
        discord_id: string;
        key: string;
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
        embed.setTitle('Instrucciones para vincular VNDB');
        embed.setDescription(
            `▸ Presiona el botón que dice **Autorizar**. Te enviaremos a VNDB.\n`+
            `▸ Si tienes la sesión cerrada, iniciala.\n`+
            `▸ Crea en el formulario un nuevo **token** de aplicación.\n`+
            `▸ Marca la casilla **Access private items on my list**.\n`+
            `▸ Luego, debes copiar el token y enviar el formulario presionando el botón **submit**.\n`+
            `▸ Vuelves aquí y presionas el botón **Ingresar código**. Pegas el token en el formulario y lo envias.`
        );
        embed.setFooter({ text: 'No compartas el token con nadie.' });

        const URL = 'https://vndb.org/u/tokens';

        const row = new ActionRowBuilder<ButtonBuilder>();
        row.addComponents(
            new ButtonBuilder({
                style: ButtonStyle.Link,
                url: URL,
                label: 'Autorizar'
            }),
            new ButtonBuilder({
                style: ButtonStyle.Primary,
                customId: `setup-instructions-vndb-button_${member.key}`,
                label: 'Ingresar token',
            })
        );

        const bot = interaction.client as Bot;
        bot.update(member.key, member, 120_000);

        await interaction.reply({
            flags: [MessageFlags.Ephemeral],
            embeds: [embed],
            components: [row]
        });
    }
};