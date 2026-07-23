import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, Interaction, InteractionContextType, MessageFlags, SlashCommandBuilder } from "discord.js";
import * as uuid from 'uuid';
import responsesHelper from "../../helpers/responses.helper";
import ErrorEmbed from "../../embeds/errorEmbed";
import GuildChatInputCommandInteraction from "../../extensions/guildChatInputCommandInteraction.extension";
import mongo from "../../database/mongo";
import { UUID } from "mongodb";

const execute = async (interaction: GuildChatInputCommandInteraction) => {
    try {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const members = mongo.collection('members');
        let member = await members.findOne({ discord_id: interaction.user.id });

        const embed = new EmbedBuilder();
        embed.setColor(Colors.DarkOrange);

        if (!member) {
            member = {
                _id: new UUID(uuid.v7()) as any,
                discord_id: interaction.user.id,
                exchanges: {
                    completed_count: 0,
                    active: null,
                    history: []
                },
                preferred_platform: null,
                anilist: null,
                mal: null,
                guilds: [{
                    id: interaction.guild.id,
                    show_scores: true
                }]
            };

            await members.insertOne(member);

            embed.setDescription('Hemos registrado tu perfil. ¿Deseas vincular una plataforma? Ten en cuenta que aún no implementamos todas las funcionalidades para MAL.');
        } else {
            embed.setDescription('Ya tienes un perfil. ¿Deseas vincular una plataforma? Ten en cuenta que aún no implementamos todas las funcionalidades para MAL.');
        };

        const cacheID = interaction.client.set(member, 60_000);

        const row = new ActionRowBuilder<ButtonBuilder>();
        row.addComponents([
            new ButtonBuilder()
                .setCustomId(`setup-anilist-button_${cacheID}`)
                .setLabel('ANILIST')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`setup-mal-button_${cacheID}`)
                .setLabel('MyAnimeList')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`setup-vndb-button_${cacheID}`)
                .setLabel('VNDB')
                .setStyle(ButtonStyle.Primary)
        ]);

        await interaction.editReply({
            embeds: [embed],
            components: [row]
        });
    } catch (error: any) {
        console.error(error);
        await responsesHelper.execute(interaction, [new ErrorEmbed(error.message)], { flags: [MessageFlags.Ephemeral] });
    };
};

module.exports = {
    cooldown: 60,
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup your profile.')
        .setDescriptionLocalization('es-ES', 'Crea tu perfil.')
        .setDescriptionLocalization('es-419', 'Crea tu perfil.')
        .setNSFW(false)
        .setContexts(InteractionContextType.Guild),
    execute: execute
};