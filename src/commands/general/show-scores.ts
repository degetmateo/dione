import { InteractionContextType, MessageFlags, SlashCommandBuilder } from "discord.js";
import mongo from "../../database/mongo";
import GenericError from "../../errors/genericError";
import SuccessEmbed from "../../embeds/successEmbed";
import GuildChatInputCommandInteraction from "../../extensions/guildChatInputCommandInteraction.extension";

const execute = async (interaction: GuildChatInputCommandInteraction) => {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    
    const enabled = interaction.options.getBoolean('enabled', true);
    const members = mongo.collection('members');
    const member = await members.findOne({ discord_id: interaction.user.id });
    
    if (!member) throw new GenericError('No estás registrado. Usa \`/setup\`.');

    let i = 0;
    let found = false;
    while (i < member.guilds.length) {
        if (member.guilds[i].id == interaction.guild.id) {
            found = true;
            break;
        };

        i++;
    };

    if (found) {
        member.guilds[i].show_scores = enabled;
    } else {
        member.guilds.push({
            id: interaction.guild.id,
            show_scores: enabled
        });
    };

    await members.updateOne(
        { _id: member._id },
        { $set: { guilds: member.guilds } }
    );

    await interaction.editReply({
        embeds: [new SuccessEmbed(enabled ? 'Ahora tus puntuaciones se mostrarán en este servidor.' : 'Ahora tus puntuaciones NO se mostrarán en este servidor.')]
    });
};

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('show-scores')
        .setDescription('Show your scores for each anime being displayed in this server.')
        .setNSFW(false)
        .setContexts(InteractionContextType.Guild)
        .addBooleanOption(option => {
            return option
                .setName('enabled')
                .setDescription('If you want this feature to be enabled for you in this server.')
                .setRequired(true)
        }),
    execute: execute
};