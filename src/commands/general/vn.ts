import { ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionContextType, SlashCommandBuilder } from "discord.js";
import GuildChatInputCommandInteraction from "../../extensions/guildChatInputCommandInteraction.extension";
import VNDB from "../../apis/vndb/vndb";
import VNEmbed from "../../embeds/vnEmbed";

const execute = async (interaction: GuildChatInputCommandInteraction) => {
    await interaction.deferReply();

    const args = interaction.options.getString('name-or-id', true);
    const data = await VNDB.query(args);

    if (data.results.length === 1) {
        return await interaction.editReply({
            embeds: [new VNEmbed(data.results[0])]
        });
    };

    const embeds = data.results.map(vn => new VNEmbed(vn));

    let index = 0;

    const row = new ActionRowBuilder<ButtonBuilder>();
    const backButton = new ButtonBuilder()
        .setCustomId('back')
        .setLabel('←')
        .setStyle(ButtonStyle.Primary);
    const nextButton = new ButtonBuilder()
        .setCustomId('next')
        .setLabel('→')
        .setStyle(ButtonStyle.Primary);
    row.addComponents(backButton, nextButton);

    const response = await interaction.editReply({
        embeds: [embeds[index]],
        components: [row]
    });

    const collector = response.createMessageComponentCollector({
        time: 300000
    });

    collector.on('collect', async collected => {
        try {
            if (collected.customId === 'next') {
                index++;
                if (index > embeds.length - 1) {
                    index = 0;
                };
            };

            if (collected.customId === 'back') {
                index--;
                if (index < 0) {
                    index = embeds.length - 1;
                };
            };

            if (collected.replied || collected.deferred) {
                await collected.editReply({
                    embeds: [embeds[index]],
                    components: [row]
                });
            } else {
                await collected.update({
                    embeds: [embeds[index]],
                    components: [row]
                });
            };
        } catch (error) {
            console.error(error);
            collector.stop();
        };
    });
};

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('vn')
        .setDescription('Search a Visual Novel on VNDB.')
        .setContexts(InteractionContextType.Guild)
        .setNSFW(false)
        .addStringOption(option => {
            return option
                .setName('name-or-id')
                .setDescription('Name or ID of the Visual Novel.')
                .setRequired(true)
        }),
    execute: execute
};