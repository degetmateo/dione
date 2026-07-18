import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction } from "discord.js";
import Helpers from "../../helpers";
import AnimeValidator from "../../validators/animeValidator";
import AnimeEmbed from "../../embeds/animeEmbed";
import searchAnimeById from "./searchAnimeById";
import searchAnimeByName from "./searchAnimeByName";
import SuccessEmbed from "../../embeds/successEmbed";
import GenericError from "../../errors/genericError";
import ErrorEmbed from "../../embeds/errorEmbed";
import ScoresEmbed from "../../embeds/scoresEmbed";
import searchScores from "../../apis/anilist/searchScores";
import mongo from "../../database/mongo";
import GuildChatInputCommandInteraction from "../../extensions/guildChatInputCommandInteraction.extension";

export default class AnimeCommandInteraction {
    private interaction: GuildChatInputCommandInteraction;
    
    constructor (interaction: GuildChatInputCommandInteraction) {
        this.interaction = interaction;
    };

    async execute () {
        await this.interaction.deferReply();

        const args = this.interaction.options.getString('name-or-id') as string;

        const membersCollection = mongo.collection('members');
        const members = await membersCollection.find(
            { $and: [{ 'guilds.id': this.interaction.guild?.id }, { 'guilds.show_scores': true }] }
        ).toArray();

        if (Helpers.isNumber(args)) {
            AnimeValidator.validateId(args);

            const data = await searchAnimeById(args);
            
            if (members.length <= 0) {
                return await this.interaction.editReply({
                    embeds: [new AnimeEmbed(data)]
                });
            };

            await this.interaction.editReply({
                embeds: [new AnimeEmbed(data), new SuccessEmbed('Buscando puntuaciones...')]
            });

            const scores = await searchScores(args, members.map(m => m.anilist.id));

            const embed = scores.length > 0 ?
                new ScoresEmbed(scores) :
                new ErrorEmbed('¡Parece que nadie conoce esto!');

            await this.interaction.editReply({
                embeds: [new AnimeEmbed(data), embed]
            });
        } else {
            AnimeValidator.validateName(args);

            const data: { media: any[] } = await searchAnimeByName(args);
            if (data.media.length <= 0) throw new GenericError('¡No encontramos resultados!');
            
            const media = data.media;
            const embeds = media.map(m => new AnimeEmbed(m));
            const scores: any = [];

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

            if (members.length <= 0) {
                scores[index] = new ErrorEmbed('¡Parece que nadie conoce esto!');
            } else {
                const s = await searchScores(media[index].id, members.map(m => m.anilist.id));

                scores[index] = s.length > 0 ?
                    new ScoresEmbed(s) :
                    new ErrorEmbed('¡Parece que nadie conoce esto!');
            };
            
            const response = await this.interaction.editReply({
                embeds: [embeds[index], scores[index]],
                components: [row]
            });

            const collector = response.createMessageComponentCollector({
                time: 300000
            });

            collector.on('collect', async (button) => {
                try {
                    if (button.customId === 'next') {
                        index++;
                        if (index > embeds.length - 1) {
                            index = 0;
                        };
                    };
        
                    if (button.customId === 'back') {
                        index--;
                        if (index < 0) {
                            index = embeds.length - 1;
                        };
                    };

                    if (!scores[index]) {
                        if (members.length <= 0) {
                            scores[index] = new ErrorEmbed('¡Parece que nadie conoce esto!');
                        } else {
                            const s = await searchScores(media[index].id, members.map(m => m.anilist.id));
    
                            scores[index] = s.length > 0 ?
                                new ScoresEmbed(s) :
                                new ErrorEmbed('¡Parece que nadie conoce esto!');
                        };
                    };

                    if (button.replied || button.deferred) {
                        await button.editReply({
                            embeds: [embeds[index], scores[index]],
                            components: [row]
                        });
                    } else {
                        await button.update({
                            embeds: [embeds[index], scores[index]],
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