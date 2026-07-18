import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, MessageFlags } from "discord.js";
import mongo from "../../../../database/mongo";
import GuildChatInputCommandInteraction from "../../../../extensions/guildChatInputCommandInteraction.extension";
import ErrorEmbed from "../../../../embeds/errorEmbed";

const exchangeCancelCommandExecute = async (interaction: GuildChatInputCommandInteraction) => {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const members = mongo.collection('members');
    const memberA = await members.findOne({ discord_id: interaction.user.id });

    if (!memberA) {
        return await interaction.editReply({
            embeds: [new ErrorEmbed(`No estás registrado. Usa \`/setup\` para registrarte.`)]
        });
    };

    if (!memberA.exchanges || !memberA.exchanges.active) {
        return await interaction.editReply({
            embeds: [new ErrorEmbed(`No tienes ningún intercambio activo.`)]
        });
    };

    const cacheID = Date.now().toString(36);

    const data = {
        memberAID: interaction.user.id,
        memberBID: memberA.exchanges.active.member.discord_id,
        caches: [cacheID]
    };

    interaction.client.cache.set(cacheID, data);

    setTimeout(() => {
        interaction.client.cache.delete(cacheID);
    }, 60_000);

    const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder({
            style: ButtonStyle.Danger,
            customId: `exchange-cancel-button_${cacheID}`,
            label: 'Cancelar'
        })
    );
    
    const embed = new EmbedBuilder();
    embed.setDescription(`¿Estas seguro de que quieres cancelar tu intercambio con <@${memberA.exchanges.active.member.discord_id}>?`)
    embed.setColor(Colors.Yellow);

    await interaction.editReply({
        embeds: [embed],
        components: [row]
    });
};

export default exchangeCancelCommandExecute;