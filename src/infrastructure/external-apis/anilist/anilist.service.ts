import { AniListHttpClient } from './anilist-http.client';
import { AniListCharacterService } from './anilist-character.service';
import { AniListMediaService } from './anilist-media.service';
import { AniListUserService } from './anilist-user.service';
import { Aniuser } from '../../../domain/models';

export class AniListService {
    public readonly client: AniListHttpClient;
    public readonly characters: AniListCharacterService;
    public readonly media: AniListMediaService;
    public readonly users: AniListUserService;

    public constructor(client?: AniListHttpClient) {
        this.client = client ?? new AniListHttpClient();
        this.characters = new AniListCharacterService(this.client);
        this.media = new AniListMediaService(this.client);
        this.users = new AniListUserService(this.client);
    }

    public async request(query: string): Promise<any> {
        return this.client.executeQuery(query);
    }

    public async authorizedRequest(query: string, token: string): Promise<any> {
        return this.client.executeQuery(query, token);
    }

    public async viewer(token: string): Promise<any> {
        return this.users.getViewer(token);
    }

    public async random(criteria: { user_id: string; type: 'ANIME' | 'MANGA' }): Promise<any[]> {
        return this.media.getRandomPlanning(criteria.user_id, criteria.type);
    }

    public readonly search = {
        user: async (idOrName: string | number) => this.users.searchUser(idOrName),
        scores: async (mediaId: number | string, userIds: string[]) => this.users.searchScores(mediaId, userIds),
        entries: async (aId: string, bId: string) => this.users.searchEntries(aId, bId),
        anime: {
            id: async (id: number | string) => this.media.searchAnimeById(id),
            name: async (name: string) => this.media.searchAnimeByName(name),
        },
        manga: {
            id: async (id: number | string) => this.media.searchMangaById(id),
            name: async (name: string) => this.media.searchMangaByName(name),
        },
    };

    public readonly get = {
        character: {
            id: async (id: number | string) => this.characters.getById(id),
            name: async (name: string) => this.characters.getByName(name),
        },
    };

    public readonly authorized = {
        get: {
            user: async (idOrToken: any, maybeToken?: string) => {
                if (maybeToken) {
                    const raw = await this.users.searchUser(idOrToken);
                    return new Aniuser(raw);
                }
                const viewer = await this.users.getViewer(idOrToken);
                const user = await this.users.searchUser(viewer.id);
                return new Aniuser(user);
            },
        },
    };
}
