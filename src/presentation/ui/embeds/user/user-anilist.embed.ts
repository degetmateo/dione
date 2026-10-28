import { ColorResolvable, EmbedBuilder } from 'discord.js';
import toHex from 'colornames';
import { Aniuser } from '../../../../domain/models';

export class UserAnilistEmbed extends EmbedBuilder {
    public constructor(aniuser: Aniuser) {
        super();
        this.setTitle(aniuser.getName());
        this.setURL(aniuser.getSiteURL());
        this.setThumbnail(aniuser.getAvatarURL());
        this.setImage(aniuser.getBannerURL());

        const profileColor = aniuser.getProfileColor();
        let color: ColorResolvable = 'Random';
        if (profileColor) {
            color = (profileColor.startsWith('#') ? profileColor : toHex(profileColor)) as ColorResolvable;
        }
        this.setColor(color);

        const anime = aniuser.data?.statistics?.anime?.statuses ?? [];
        const manga = aniuser.data?.statistics?.manga?.statuses ?? [];
        const cAnime = anime.find((s: any) => s.status === 'COMPLETED')?.count ?? 0;
        const dAnime = anime.find((s: any) => s.status === 'DROPPED')?.count ?? 0;
        const curAnime = anime.find((s: any) => s.status === 'CURRENT')?.count ?? 0;

        const cManga = manga.find((s: any) => s.status === 'COMPLETED')?.count ?? 0;
        const dManga = manga.find((s: any) => s.status === 'DROPPED')?.count ?? 0;
        const curManga = manga.find((s: any) => s.status === 'CURRENT')?.count ?? 0;

        const description =
            `**Información de ANILIST**\n` +
            `▸ Se unió el \`${aniuser.getCreatedAt().toLocaleDateString()}\`\n\n` +
            `**[Anime](${aniuser.getSiteURL()}/animelist)**\n` +
            `▸ Completados: \`${cAnime}\`\n` +
            `▸ Abandonados: \`${dAnime}\`\n` +
            `▸ En progreso: \`${curAnime}\`\n` +
            `▸ Episodios Vistos: \`${aniuser.getAnimeEpisodesWatched()}\`\n` +
            `▸ Tiempo Visto: \`${aniuser.getAnimeHoursWatched().toFixed(1)} horas\`\n` +
            `▸ Calificación Promedio: \`${aniuser.getAnimeMeanScore()}\`\n\n` +
            `**[Manga](${aniuser.getSiteURL()}/mangalist)**\n` +
            `▸ Completados: \`${cManga}\`\n` +
            `▸ Abandonados: \`${dManga}\`\n` +
            `▸ En progreso: \`${curManga}\`\n` +
            `▸ Capítulos Leídos: \`${aniuser.getMangaChaptersRead()}\`\n` +
            `▸ Volúmenes Leídos: \`${aniuser.getMangaVolumesRead()}\`\n` +
            `▸ Calificación Promedio: \`${aniuser.getMangaMeanScore()}\`\n\n`;

        this.setDescription(description);
    }
}

