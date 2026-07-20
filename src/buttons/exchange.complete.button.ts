import { ButtonInteraction, MessageFlags } from "discord.js";
import Bot from "../extensions/bot.extension";
import ErrorEmbed from "../embeds/errorEmbed";
import mongo from "../database/mongo";
import SuccessEmbed from "../embeds/successEmbed";

const execute = async (interaction: ButtonInteraction) => {
    const bot = interaction.client as Bot;
    const values = interaction.customId.split('_');

    const data: {
        memberA: any;
        caches: string[];
    } = bot.cache.get(values[1]);

    if (!data) {
        return await interaction.reply({
            flags: [MessageFlags.Ephemeral],
            embeds: [new ErrorEmbed('Esta interacción ha expirado.')]
        });
    };

    if (data.memberA.discord_id != interaction.user.id) {
        return await interaction.reply({
            flags: [MessageFlags.Ephemeral],
            embeds: [new ErrorEmbed('No tienes permiso para interactuar con esto.')]
        });
    };

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const members = mongo.collection('members');
    
    const memberB = await members.findOneAndUpdate(
        { 
            discord_id: data.memberA.exchanges.active.members.b.discord_id
        },
        { 
            $set: { 
                'exchanges.active.completed': true
            } 
        }
    );

    if (!memberB) {
        return await interaction.editReply({
            embeds: [new ErrorEmbed('Ha ocurrido un error inesperado.')]
        });
    };

    const memberAExchanges: any = data.memberA.exchanges;
    const memberBExchanges: any = memberB.exchanges;

    memberBExchanges.active.completed = true;
    memberBExchanges.active.completed_at = new Date();

    if (memberAExchanges.active.completed) {
        delete memberAExchanges.active.completed;
        delete memberBExchanges.active.completed;

        const memberAHistory = memberAExchanges.history || [];
        const memberBHistory = memberBExchanges.history || [];

        memberAHistory.push(memberAExchanges.active);
        memberBHistory.push(memberBExchanges.active);

        memberAExchanges.history = memberAHistory;
        memberBExchanges.history = memberBHistory;

        memberAExchanges.active = null;
        memberBExchanges.active = null;

        if (!memberAExchanges.completed_count) memberAExchanges.completed_count = 0;
        if (!memberBExchanges.completed_count) memberBExchanges.completed_count = 0;

        memberAExchanges.completed_count += 1;
        memberBExchanges.completed_count += 1;

        await members.updateOne(
            { _id: data.memberA._id },
            { $set: { exchanges: memberAExchanges } }
        );

        await members.updateOne(
            { _id: memberB._id },
            { $set: { exchanges: memberBExchanges } }
        );

        if (interaction.channel && interaction.channel.isSendable()) {
            await interaction.channel.send({
                content: `<@${data.memberA.discord_id}> <@${memberB.discord_id}>:`,
                embeds: [new SuccessEmbed(`¡Felicidades! Han completado exitosamente su intercambio. Se ha registrado correctamente en el historial.`)]
            });
        };
    } else {
        await members.updateOne(
            { _id: memberB._id },
            { $set: { 'exchanges.active': memberBExchanges.active } }
        );

        await interaction.editReply({
            embeds: [new SuccessEmbed(`<@${memberB.discord_id}> ha completado su parte del intercambio.`)]
        });
    };
};

module.exports = {
    execute: execute,
    id: 'exchange-complete-button'
};