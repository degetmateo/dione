import { ButtonInteraction, MessageFlags } from "discord.js";
import ErrorEmbed from "../embeds/errorEmbed";
import mongo from "../database/mongo";
import SuccessEmbed from "../embeds/successEmbed";

const exchangeCreateButtonFinishExecute = async (interaction: ButtonInteraction) => {
    const values = interaction.customId.split('_');

    const bot: any = interaction.client;

    const data: {
        memberAID: string;
        memberBID: string;
        memberAMediaType: string;
        memberAMediaID: string;
        memberBMediaType: string;
        memberBMediaID: string;
        caches: string[];
    } = bot.cache.get(values[1]);

    if (!data) {
        return await interaction.reply({
            flags: [MessageFlags.Ephemeral],
            embeds: [new ErrorEmbed('¡Este intercambio ya expiró!')]
        });
    };

    if (interaction.user.id != data.memberAID) {
        return await interaction.reply({
            flags: [MessageFlags.Ephemeral],
            embeds: [new ErrorEmbed('¡Este intercambio no es para ti!')]
        });
    };

    for (const cache of data.caches) {
        bot.cache.delete(cache);
    };

    await interaction.deferReply();

    const members = mongo.collection('members');
    const memberA = await members.findOne({ discord_id: data.memberAID });
    
    if (!memberA) {
        return await interaction.editReply({
            embeds: [new ErrorEmbed(`<@${data.memberAID}> no está registrado. Debe usar \`/setup\` para registrarse.`)]
        });
    };

    if (memberA.exchanges) {
        if (memberA.exchanges.active) {
            return await interaction.editReply({
                embeds: [new ErrorEmbed(`¡<@${data.memberAID}> ya tiene un intercambio activo!`)]
            });
        };
    };

    const memberB = await members.findOne({ discord_id: data.memberBID });

    if (!memberB) {
        return await interaction.editReply({
            embeds: [new ErrorEmbed(`<@${data.memberBID}> no está registrado. Debe usar \`/setup\` para registrarse.`)]
        });
    };

    if (memberB.exchanges) {
        if (memberB.exchanges.active) {
            return await interaction.editReply({
                embeds: [new ErrorEmbed(`¡<@${data.memberBID}> ya tiene un intercambio activo!`)]
            });
        };
    };

    await members.updateOne(
        { _id: memberA._id },
        { $set: { 'exchanges.active': { 
            member: { 
                discord_id: data.memberBID, 
                media_id: data.memberAMediaID,
                media_type: data.memberAMediaType
            },
            media_id: data.memberBMediaID,
            media_type: data.memberBMediaType
        } } }
    );

    await members.updateOne(
        { _id: memberB._id },
        { $set: { 'exchanges.active': { 
            member: { 
                discord_id: data.memberAID, 
                media_id: data.memberBMediaID,
                media_type: data.memberBMediaType
            },
            media_id: data.memberAMediaID,
            media_type: data.memberAMediaType
        } } }
    );

    await interaction.editReply({
        embeds: [new SuccessEmbed(`<@${data.memberAID}> y <@${data.memberBID}> iniciaron un intercambio 🤝.`)]
    });
};

export default exchangeCreateButtonFinishExecute;