import anilist from "../../../../apis/anilist/anilist";
import commonRequests from "../../../../apis/common/common.requests";
import mongo from "../../../../database/mongo";
import AnimeEmbed from "../../../../embeds/animeEmbed";
import ErrorEmbed from "../../../../embeds/errorEmbed";
import ScoresEmbed from "../../../../embeds/scoresEmbed";
import GuildChatInputCommandInteraction from "../../../../extensions/guildChatInputCommandInteraction.extension";
import AnimeValidator from "../../../../validators/animeValidator";

const animeExecuteId = async (interaction: GuildChatInputCommandInteraction) => {
    const id = interaction.options.getString('name-or-id') as string;
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

    AnimeValidator.validateId(id);

    const data = await anilist.search.anime.id(id);
    data.type = 'ANIME';

    const animeEmbed = new AnimeEmbed(data);

    if (members.length <= 0) {
        return await interaction.editReply({
            embeds: [animeEmbed]
        });
    };

    const scores = await commonRequests.search.scores({
        ...data,
        type: 'ANIME'
    }, members as any);

    const scoresEmbed = scores.length > 0 ?
        new ScoresEmbed(scores) :
        new ErrorEmbed('¡Parece que nadie conoce esto!');

    await interaction.editReply({
        embeds: [animeEmbed, scoresEmbed]
    });
};

export default animeExecuteId;