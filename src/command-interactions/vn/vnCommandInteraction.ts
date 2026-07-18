import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import VNDB from "../../apis/vndb/vndb";
import VNEmbed from "../../embeds/vnEmbed";
import GuildChatInputCommandInteraction from "../../extensions/guildChatInputCommandInteraction.extension";

export default class VNCommandInteraction {
    private interaction: GuildChatInputCommandInteraction;
    
    constructor (interaction: GuildChatInputCommandInteraction) {
        this.interaction = interaction;
    };

    async execute () {
        await this.interaction.deferReply();

        const args = this.interaction.options.getString('name-or-id', true);
        const data = await VNDB.query(args);

        if (data.results.length === 1) {
            return await this.interaction.editReply({
                embeds: [new VNEmbed(data.results[0])]
            });
        } else {
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

            const response = await this.interaction.editReply({
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
    };
};