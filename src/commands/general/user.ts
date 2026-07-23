import { ColorResolvable, EmbedBuilder, InteractionContextType, SlashCommandBuilder } from "discord.js";
import toHex from 'colornames';
import GenericError from "../../errors/genericError";
import mongo from "../../database/mongo";
import GuildChatInputCommandInteraction from "../../extensions/guildChatInputCommandInteraction.extension";
import anilist from "../../apis/anilist/anilist";
import Aniuser from "../../apis/anilist/models/aniuser";
import mal from "../../apis/mal/mal";
import Helpers from "../../helpers";

const execute = async (interaction: GuildChatInputCommandInteraction) => {
    await interaction.deferReply();

    const memberId = interaction.options.getUser('member')?.id || interaction.user.id;

    const members = mongo.collection('members');
    const member = await members.findOne(
        { 
            discord_id: memberId 
        }
    );
    
    if (!member) {
        if (memberId === interaction.user.id) {
            throw new GenericError(`No estás registrado. Usá \`/setup\` para registrarte.`);
        } else {
            throw new GenericError(`<@${memberId}> no está registrado. Debe usar \`/setup\` para registrarse.`);
        };
    };

    let embed: EmbedBuilder = new EmbedBuilder();

    embed.setTitle(interaction.user.globalName);

    let description = `Intercambios completados: **[${member.exchanges.completed_count}]**\n\n`;

    if (member.preferred_platform) {
        if (member.preferred_platform === 'mal') {
            const maluser: any = await mal.user.get({ id: member.mal.id, token: member.mal.auth.access_token });
    
            embed.setURL(`https://myanimelist.net/profile/${maluser.name}`);
            embed.setThumbnail(maluser.picture);
            embed.setColor('Random');
    
            description += 
                `**Información de MyAnimeList**\n`+
                `▸ Conocido como \`${maluser.name}\`\n`+
                `▸ Se unió el \`${new Date(maluser.joined_at).toDateString()}\`\n`+
                `▸ Cumpleaños: \`${new Date(maluser.birthday).toDateString()}\`\n`+
                `▸ Género: \`${maluser.gender || 'desconocido'}\`\n`+
                `▸ Ubicación: \`${maluser.location || 'desconocida'}\`\n\n`+
                `**Estadísticas en Anime**\n`+
                `▸ Calificación promedio: **[${maluser.anime_statistics.mean_score}]**\n`+
                `▸ Completados: **[${maluser.anime_statistics.num_items_completed}]**\n`+
                `▸ Abandonados: **[${maluser.anime_statistics.num_items_dropped}]**\n`+
                `▸ Episodios vistos: **[${maluser.anime_statistics.num_episodes}]**\n`+
                `▸ Días vistos: **[${maluser.anime_statistics.num_days_watched}]**\n`
            ;
        } else {
            const data = await anilist.search.user(member.anilist.id);
            const aniuser = new Aniuser(data);
    
            embed
                .setURL(aniuser.getSiteURL())
                .setColor((toHex(aniuser.getProfileColor()) as ColorResolvable))
                .setImage(aniuser.getBannerURL())
                .setThumbnail(aniuser.getAvatarURL())
            ;
    
            const bestBayesianScores = aniuser.getGenresSortedByBayesianScore().slice(0, 3).map(g => g.genre);
    
            const worstBayesianScores = aniuser.getGenresSortedByBayesianScore().slice(aniuser.getGenresSortedByBayesianScore().length - 3, aniuser.getGenresSortedByBayesianScore().length).map(g => g.genre);
    
            const completedAnime = aniuser.data.statistics.anime.statuses.find((s: any) => s.status == 'COMPLETED');
            const droppedAnime = aniuser.data.statistics.anime.statuses.find((s: any) => s.status == 'DROPPED');
            const currentAnime = aniuser.data.statistics.anime.statuses.find((s: any) => s.status=='CURRENT');
    
            const completedManga = aniuser.data.statistics.manga.statuses.find((s: any) => s.status == 'COMPLETED');
            const droppedManga = aniuser.data.statistics.manga.statuses.find((s: any) => s.status == 'DROPPED');
            const currentManga = aniuser.data.statistics.manga.statuses.find((s: any) => s.status=='CURRENT');
    
            description +=
                `**Información de ANILIST**\n` +
                `▸ Conocido como \`${aniuser.getName()}\`\n`+
                `▸ Se unio el **${aniuser.getCreatedAt().toLocaleDateString()}**\n\n` +
    
                `**[Anime](${aniuser.getSiteURL()}/animelist)**\n` +
                `▸ Completados: **${completedAnime?.count || 0}**\n`+
                `▸ Abandonados: **${droppedAnime?.count || 0}**\n`+
                `▸ En progreso: **${currentAnime?.count || 0}**\n`+
                `▸ Episodios Vistos: **${aniuser.getAnimeEpisodesWatched()}**\n` +
                `▸ Tiempo Visto: **${(aniuser.getAnimeHoursWatched()).toFixed(1)} horas**\n`+
                `▸ Calificación Promedio: **${aniuser.getAnimeMeanScore()}**\n\n`+
    
                `**[Manga](${aniuser.getSiteURL()}/mangalist)**\n`+
                `▸ Completados: **${completedManga?.count || 0}**\n`+
                `▸ Abandonados: **${droppedManga?.count || 0}**\n`+
                `▸ En progreso: **${currentManga?.count || 0}**\n`+
                `▸ Capítulos Leídos: **${aniuser.getMangaChaptersRead()}**\n`+
                `▸ Volúmenes Leídos: **${aniuser.getMangaVolumesRead()}**\n`+
                `▸ Calificación Promedio: **${aniuser.getMangaMeanScore()}**\n\n`+
    
                `**Tendencias**\n`+
                `▸ Más consumido: **${Helpers.capitalizeText(aniuser.getMostConsumedGenre()?.genre)} [${aniuser.getMostConsumedGenre()?.count}]**\n`+
                `▸ Menos consumido: **${Helpers.capitalizeText(aniuser.getLeastConsumedGenre()?.genre)} [${aniuser.getLeastConsumedGenre()?.count}]**\n\n`+
    
                `▸ Mejor calificado: **${Helpers.capitalizeText(aniuser.getBestRatedGenre()?.genre)} [${aniuser.getBestRatedGenre().meanScore.toFixed(2)}]**\n`+
                `▸ Peor calificado: **${Helpers.capitalizeText(aniuser.getWorstRatedGenre()?.genre)} [${aniuser.getWorstRatedGenre()?.meanScore.toFixed(2)}]**\n\n`+
    
                `▸ Suele gustarle: **${Helpers.capitalizeText(bestBayesianScores.join(' - '))}**\n`+
                `▸ No suele gustarle: **${Helpers.capitalizeText(worstBayesianScores.join(' - '))}**`
            ;
        };
    } else {
        embed.setThumbnail(interaction.user.avatarURL());
        embed.setImage(interaction.user.bannerURL() || null);
        embed.setColor(interaction.user.hexAccentColor as ColorResolvable || null);

        description +=
            `Para agregar más información debes iniciar sesión con **ANILIST** o **MyAnimeList** usando \`/setup\`.`;
    };

    embed.setDescription(description);

    await interaction.editReply({
        embeds: [embed]
    });
};

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('user')
        .setContexts(InteractionContextType.Guild)
        .setNSFW(false)
        .setDescription('ANILIST or MAL user information.')
        .setDescriptionLocalization('es-ES', 'Información de ANILIST o MAL de un usuario.')
        .setDescriptionLocalization('es-419', 'Información de ANILIST o MAL de un usuario.')
        .addUserOption(option => 
            option
                .setName('member')
                .setDescription('The user to get information for.')
                .setDescriptionLocalization('es-ES', 'El usuario del que obtener información.')
                .setDescriptionLocalization('es-419', 'El usuario del que obtener información.')
                .setRequired(false)),
    execute: execute
};