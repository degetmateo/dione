import { ButtonInteraction, MessageFlags } from "discord.js";
import Bot from "../extensions/bot.extension";
import ErrorEmbed from "../embeds/errorEmbed";
import mongo from "../database/mongo";
import SuccessEmbed from "../embeds/successEmbed";

export default async (interaction: ButtonInteraction) => {
    const bot = interaction.client as Bot;
    const values = interaction.customId.split('_');

    const data: {
        memberAID: string;
        memberBID: string;
        completed: boolean;
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

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const members = mongo.collection('members');
    
    const memberB = await members.findOneAndUpdate(
        { discord_id: data.memberBID, 'exchanges.active.member.discord_id': data.memberAID },
        { $set: { 'exchanges.active.completed': true } }
    );

    if (!memberB) {
        return await interaction.editReply({
            embeds: [new ErrorEmbed('Ha ocurrido un error inesperado.')]
        });
    };

    if (data.completed) {
        if (interaction.channel && interaction.channel.isSendable()) {
            await interaction.channel.send({
                content: `<@${data.memberAID}> <@${data.memberBID}>:`,
                embeds: [new SuccessEmbed(`¡Felicidades! Han completado exitosamente su intercambio. Se ha registrado correctamente en el historial.`)]
            });
        };
    } else {
        await interaction.editReply({
            embeds: [new SuccessEmbed(`<@${data.memberBID}> ha completado su parte del intercambio.`)]
        });
    };
};