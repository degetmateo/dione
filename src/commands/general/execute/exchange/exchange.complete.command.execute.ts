import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder } from "discord.js";
import mongo from "../../../../database/mongo";
import ErrorEmbed from "../../../../embeds/errorEmbed";
import GuildChatInputCommandInteraction from "../../../../extensions/guildChatInputCommandInteraction.extension";
import Bot from "../../../../extensions/bot.extension";

const exchangeCompleteCommandExecute = async (interaction: GuildChatInputCommandInteraction) => {
    const bot = interaction.client as Bot;
    await interaction.deferReply({ flags: ["Ephemeral"] });
    
    const members = mongo.collection('members');
    const memberA = await members.findOne({ discord_id: interaction.user.id });

    if (!memberA) {
        return interaction.editReply({
            embeds: [new ErrorEmbed('No estás registrado. Usa \`/setup\` para registrarte.')]
        });
    };

    if (!memberA.exchanges || !memberA.exchanges.active) {
        return interaction.editReply({
            embeds: [new ErrorEmbed('No tienes ningún intercambio activo.')]
        });
    };

    const cacheID = Date.now().toString(36);

    const data = {
        memberA: memberA,
        caches: [cacheID]
    };

    bot.cache.set(cacheID, data);

    setTimeout(() => {
        bot.cache.delete(cacheID);
    }, 60_000);

    const embed = new EmbedBuilder();
    embed.setDescription(`Estás a punto de indicar que <@${memberA.exchanges.active.member.discord_id}> completó su parte del intercambio. ¿Estás seguro?`);
    embed.setColor(Colors.Yellow);

    const row = new ActionRowBuilder<ButtonBuilder>();

    row.addComponents(
        new ButtonBuilder()
            .setCustomId(`exchange-complete-button_${cacheID}`)
            .setLabel('Estoy seguro')
            .setStyle(ButtonStyle.Success)
    );

    await interaction.editReply({
        embeds: [embed],
        components: [row]
    });
};

export default exchangeCompleteCommandExecute;