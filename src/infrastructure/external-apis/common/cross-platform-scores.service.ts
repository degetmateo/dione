import { AniListService } from '../anilist/anilist.service';
import { MalService } from '../mal/mal.service';
import { ScoreEntry } from '../../../presentation/ui';

export class CrossPlatformScoresService {
    public constructor(
        private readonly anilist: AniListService,
        private readonly mal: MalService
    ) {}

    public async searchScores(
        media: { type: 'ANIME' | 'MANGA'; id: number | string; idMal: number },
        members: any[]
    ): Promise<ScoreEntry[]> {
        const scores: ScoreEntry[] = [];

        const aniusers = members.filter(m => m.preferred_platform === 'anilist' && m.anilist?.id);
        if (aniusers.length) {
            try {
                const aniscores = await this.anilist.users.searchScores(
                    media.id,
                    aniusers.map(m => m.anilist.id)
                );
                for (const item of aniscores) {
                    scores.push({
                        user: { type: 'aniuser', id: item.user.id, name: item.user.name },
                        status: item.status,
                        score: item.score,
                        progress: item.progress,
                        repeat: item.repeat,
                    });
                }
            } catch {
                // AniList fetch error handled gracefully
            }
        }

        const malusers = members.filter(m => m.preferred_platform === 'mal' && m.mal?.id && m.mal?.auth?.access_token);
        if (malusers.length && media.idMal) {
            try {
                const malscores = await this.mal.users.searchScores(
                    { id: media.idMal, type: media.type },
                    malusers.slice(0, 5)
                );
                for (const item of malscores) {
                    scores.push({
                        user: { type: 'maluser', id: item.user.id, name: item.user.name },
                        status: (item.my_list_status.status || 'PLANNING').toUpperCase(),
                        score: (item.my_list_status.score || 0) * 10,
                        progress: item.my_list_status.num_episodes_watched || item.my_list_status.num_chapters_read || 0,
                        repeat: 0,
                    });
                }
            } catch {
                // MAL fetch error handled gracefully
            }
        }

        return scores;
    }
}
