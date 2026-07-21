import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import mongo from "../../../../database/mongo";
import AnimeEmbed from "../../../../embeds/animeEmbed";
import GenericError from "../../../../errors/genericError";
import GuildChatInputCommandInteraction from "../../../../extensions/guildChatInputCommandInteraction.extension";
import AnimeValidator from "../../../../validators/animeValidator";
import ErrorEmbed from "../../../../embeds/errorEmbed";
import ScoresEmbed from "../../../../embeds/scoresEmbed";
import anilist from "../../../../apis/anilist/anilist";

const animeExecuteName = async (interaction: GuildChatInputCommandInteraction) => {
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
                    anilist: { $ne: null }
                }
            ] 
        }
    ).toArray();

    AnimeValidator.validateName(name);

    const data: { media: any[] } = await anilist.search.anime.name(name);
    if (data.media.length <= 0) throw new GenericError('¡No encontramos resultados!');
    
    const media = data.media;
    const embeds = media.map(m => new AnimeEmbed(m));
    const scores: any = [];

    let index = 0;

    if (members.length <= 0) {
        scores[index] = new ErrorEmbed('¡Parece que nadie conoce esto!');
    } else {
        const s = await anilist.search.scores(media[index].id, members.map(m => m.anilist.id));

        scores[index] = s.length > 0 ?
            new ScoresEmbed(s) :
            new ErrorEmbed('¡Parece que nadie conoce esto!');
    };
    
    const cacheId = interaction.client.set({
        members: members,
        embeds: embeds,
        media: media,
        scores: scores,
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
        embeds: [embeds[index], scores[index]],
        components: [row]
    });
};

export default animeExecuteName;