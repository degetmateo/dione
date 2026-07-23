import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import mongo from "../../../../database/mongo";
import GenericError from "../../../../errors/genericError";
import GuildChatInputCommandInteraction from "../../../../extensions/guildChatInputCommandInteraction.extension";
import AnimeValidator from "../../../../validators/animeValidator";
import ErrorEmbed from "../../../../embeds/errorEmbed";
import ScoresEmbed from "../../../../embeds/scoresEmbed";
import MangaEmbed from "../../../../embeds/mangaEmbed";
import anilist from "../../../../apis/anilist/anilist";
import commonRequests from "../../../../apis/common/common.requests";

const mangaExecuteName = async (interaction: GuildChatInputCommandInteraction) => {
    const name = interaction.options.getString('name-or-id') as string;
    const collection = mongo.collection('members');

    const members = await collection.find(
        { 
            $and: [
                { 
                    'guilds.id': interaction.guild.id 
                }, 
                { 
                    'guilds.show_scores': true 
                },
                {
                    preferred_platform: { $ne: null } 
                }
            ] 
        }
    ).toArray();

    AnimeValidator.validateName(name);

    const data: { media: any[] } = await anilist.search.manga.name(name);
    if (data.media.length <= 0) throw new GenericError('¡No encontramos resultados!');
    
    const media = data.media;
    const embeds = media.map(m => new MangaEmbed(m));
    const scoresEmbeds: EmbedBuilder[] = [];

    let index = 0;

    if (members.length <= 0) {
        scoresEmbeds[index] = new ErrorEmbed('¡Parece que nadie conoce esto!');
    } else {
        const scores = await commonRequests.search.scores({
            ...media[index],
            type: 'MANGA'
        }, members as any);

        scoresEmbeds[index] = scores.length > 0 ?
            new ScoresEmbed(scores) :
            new ErrorEmbed('¡Parece que nadie conoce esto!');
    };
    
    const cacheId = interaction.client.set({
        members: members,
        embeds: embeds,
        media: media,
        scores: scoresEmbeds,
        index: index
    }, 180_000);

    const row = new ActionRowBuilder<ButtonBuilder>();
    const backButton = new ButtonBuilder()
        .setCustomId(`media-back-button_${cacheId}`)
        .setLabel('←')
        .setStyle(ButtonStyle.Primary);
    const nextButton = new ButtonBuilder()
        .setCustomId(`media-next-button_${cacheId}`)
        .setLabel('→')
        .setStyle(ButtonStyle.Primary);
    row.addComponents(backButton, nextButton);

    await interaction.editReply({
        embeds: [embeds[index], scoresEmbeds[index]],
        components: [row]
    });
};

export default mangaExecuteName;