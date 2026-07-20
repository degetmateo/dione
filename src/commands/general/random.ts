import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import GenericError from "../../errors/genericError";
import GuildChatInputCommandInteraction from "../../extensions/guildChatInputCommandInteraction.extension";
import mongo from "../../database/mongo";
import Helpers from "../../helpers";
import AnimeEmbed from "../../embeds/animeEmbed";
import MangaEmbed from "../../embeds/mangaEmbed";
import anilist from "../../apis/anilist/anilist";

const execute = async (interaction: GuildChatInputCommandInteraction) => {
    await interaction.deferReply();

    const type = interaction.options.getString('type', true) as "ANIME" | "MANGA";

    const members = mongo.collection('members');
    const member = await members.findOne({ discord_id: interaction.user.id });

    if (!member) throw new GenericError('No estás registrado. Usa el comando `/setup` para registrarte.');

    const media = await anilist.random({ type: type, user_id: member.anilist.id });
    
    if (media.length <= 0) throw new GenericError(`¡No tienes ${type.toUpperCase()} en tu PTW!`);

    const selected: any = Helpers.getRandomElement(media);

    const embed = type === 'ANIME' ?
        new AnimeEmbed(selected.data) :
        new MangaEmbed(selected.data);

    await interaction.editReply({
        embeds: [embed]
    });
};

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Get a ramdom anime or manga recomendation from your PTW list.')
        .setNSFW(false)
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option => {
            return option
                .setName('type')
                .setDescription('Anime or manga.')
                .setRequired(true)
                .addChoices(
                    { name: 'Anime', value: 'ANIME' },
                    { name: 'Manga', value: 'MANGA' }
                )
        }),
    execute: execute
};