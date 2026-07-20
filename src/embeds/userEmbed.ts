import { ColorResolvable, EmbedBuilder } from "discord.js";
import toHex from 'colornames';
import Helpers from "../helpers";
import Aniuser from "../apis/anilist/models/aniuser";

export default class UserEmbed extends EmbedBuilder {
    constructor (user: Aniuser) {
        super();
        
        this
            .setColor((toHex(user.getProfileColor()) as ColorResolvable))
            .setImage(user.getBannerURL())
            .setThumbnail(user.getAvatarURL())

        const bestBayesianScores = user.getGenresSortedByBayesianScore().slice(0, 3).map(g => g.genre);

        const worstBayesianScores = user.getGenresSortedByBayesianScore().slice(user.getGenresSortedByBayesianScore().length - 3, user.getGenresSortedByBayesianScore().length).map(g => g.genre);

        const completedAnime = user.data.statistics.anime.statuses.find((s: any) => s.status == 'COMPLETED');
        const droppedAnime = user.data.statistics.anime.statuses.find((s: any) => s.status == 'DROPPED');
        const currentAnime = user.data.statistics.anime.statuses.find((s: any) => s.status=='CURRENT');

        const completedManga = user.data.statistics.manga.statuses.find((s: any) => s.status == 'COMPLETED');
        const droppedManga = user.data.statistics.manga.statuses.find((s: any) => s.status == 'DROPPED');
        const currentManga = user.data.statistics.manga.statuses.find((s: any) => s.status=='CURRENT');

        this.setDescription(
            `**[${user.getName()}](${user.getSiteURL()})**\n` +
            `↪ Se unio el **${user.getCreatedAt().toLocaleDateString()}**\n\n` +

            `**[Anime](${user.getSiteURL()}/animelist)**\n` +
            `↪ Completados: **${completedAnime?.count || 0}**\n`+
            `↪ Abandonados: **${droppedAnime?.count || 0}**\n`+
            `↪ En progreso: **${currentAnime?.count || 0}**\n`+
            `↪ Episodios Vistos: **${user.getAnimeEpisodesWatched()}**\n` +
            `↪ Tiempo Visto: **${(user.getAnimeHoursWatched()).toFixed(1)} horas**\n`+
            `↪ Calificación Promedio: **${user.getAnimeMeanScore()}**\n\n`+

            `**[Manga](${user.getSiteURL()}/mangalist)**\n`+
            `↪ Completados: **${completedManga?.count || 0}**\n`+
            `↪ Abandonados: **${droppedManga?.count || 0}**\n`+
            `↪ En progreso: **${currentManga?.count || 0}**\n`+
            `↪ Capítulos Leídos: **${user.getMangaChaptersRead()}**\n`+
            `↪ Volúmenes Leídos: **${user.getMangaVolumesRead()}**\n`+
            `↪ Calificación Promedio: **${user.getMangaMeanScore()}**\n\n`+

            `**Tendencias**\n`+
            `↪ Más consumido: **${Helpers.capitalizeText(user.getMostConsumedGenre()?.genre)} [${user.getMostConsumedGenre()?.count}]**\n`+
            `↪ Menos consumido: **${Helpers.capitalizeText(user.getLeastConsumedGenre()?.genre)} [${user.getLeastConsumedGenre()?.count}]**\n\n`+

            `↪ Mejor calificado: **${Helpers.capitalizeText(user.getBestRatedGenre()?.genre)} [${user.getBestRatedGenre().meanScore.toFixed(2)}]**\n`+
            `↪ Peor calificado: **${Helpers.capitalizeText(user.getWorstRatedGenre()?.genre)} [${user.getWorstRatedGenre()?.meanScore.toFixed(2)}]**\n\n`+

            `↪ Suele gustarle: **${Helpers.capitalizeText(bestBayesianScores.join(' - '))}**\n`+
            `↪ No suele gustarle: **${Helpers.capitalizeText(worstBayesianScores.join(' - '))}**`
        );
    };
};