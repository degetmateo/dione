import { ButtonInteraction, Colors, EmbedBuilder, MessageFlags } from "discord.js";
import Bot from "../extensions/bot.extension";
import ErrorEmbed from "../embeds/errorEmbed";
import mongo from "../database/mongo";

export default async (interaction: ButtonInteraction) => {
    const bot = interaction.client as Bot;
    const values = interaction.customId.split('_');

    const data: {
        memberAID: string;
        memberBID: string;
        caches: string[];
    } = bot.cache.get(values[1]);

    if (!data) {
        return await interaction.reply({
            flags: [MessageFlags.Ephemeral],
            embeds: [new ErrorEmbed('Esta interacción ha expirado.')]
        });
    };

    if (data.memberAID != interaction.user.id) {
        return await interaction.reply({
            flags: [MessageFlags.Ephemeral],
            embeds: [new ErrorEmbed('No tienes permiso para interactuar con esto.')]
        });
    };

    data.caches.forEach(c => bot.cache.delete(c));

    await interaction.deferReply();

    const members = mongo.collection('members');

    await members.updateOne(
        { discord_id: data.memberAID },
        { $set: { 'exchanges.active': null } }
    );

    await members.updateOne(
        { discord_id: data.memberBID },
        { $set: { 'exchanges.active': null } }
    );

    const embed = new EmbedBuilder();

    embed.setColor(Colors.DarkRed);
    embed.setDescription(`<@${data.memberAID}> ha decidido cancelar el intercambio.`);

    if (!interaction.channel?.isSendable()) return;

    await interaction.channel?.send({
        content: `<@${data.memberBID}>, malas noticias...`,
        embeds: [embed]
    });
};