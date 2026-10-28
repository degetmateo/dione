import { EmbedBuilder } from 'discord.js';

export class UserMalEmbed extends EmbedBuilder {
    public constructor(maluser: any) {
        super();
        this.setTitle(maluser.name);
        this.setURL(`https://myanimelist.net/profile/${maluser.name}`);
        this.setThumbnail(maluser.picture);
        this.setColor('Random');

        const joined = maluser.joined_at ? new Date(maluser.joined_at).toDateString() : 'desconocida';
        const birthday = maluser.birthday ? new Date(maluser.birthday).toDateString() : 'desconocido';

        const description =
            `**Información de MAL**\n` +
            `▸ Se unió el \`${joined}\`\n` +
            `▸ Cumpleaños: \`${birthday}\`\n` +
            `▸ Género: \`${maluser.gender || 'desconocido'}\`\n` +
            `▸ Ubicación: \`${maluser.location || 'desconocida'}\`\n\n` +
            `**Estadísticas en Anime**\n` +
            `▸ Calificación promedio: \`${maluser.anime_statistics?.mean_score ?? 'N/A'}\`\n` +
            `▸ Completados: \`${maluser.anime_statistics?.num_items_completed ?? 0}\`\n` +
            `▸ Abandonados: \`${maluser.anime_statistics?.num_items_dropped ?? 0}\`\n` +
            `▸ Episodios vistos: \`${maluser.anime_statistics?.num_episodes ?? 0}\`\n` +
            `▸ Días vistos: \`${maluser.anime_statistics?.num_days_watched ?? 0}\`\n`;

        this.setDescription(description);
    }
}

