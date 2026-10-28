import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AniListHttpClient } from '../../src/infrastructure/external-apis/anilist/anilist-http.client';
import { AniListCharacterService } from '../../src/infrastructure/external-apis/anilist/anilist-character.service';
import { AniListMediaService } from '../../src/infrastructure/external-apis/anilist/anilist-media.service';
import { AniListUserService } from '../../src/infrastructure/external-apis/anilist/anilist-user.service';
import { AniListService } from '../../src/infrastructure/external-apis/anilist/anilist.service';
import { ExternalApiError } from '../../src/core/errors';

describe('AniList Services and HTTP Client', () => {
    let client: AniListHttpClient;

    beforeEach(() => {
        client = new AniListHttpClient();
    });

    it('should throw ExternalApiError when GraphQL returns errors', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                errors: [{ message: 'Not Found', status: 404 }],
            }),
        } as any);

        await expect(client.executeQuery('{ Viewer { id } }')).rejects.toThrow(ExternalApiError);
    });

    it('should fetch character by ID using AniListCharacterService', async () => {
        const mockChar = { id: 10, name: { full: 'Spike Spiegel' } };
        vi.spyOn(client, 'executeQuery').mockResolvedValueOnce({ Character: mockChar });

        const service = new AniListCharacterService(client);
        const char = await service.getById(10);

        expect(char.name.full).toBe('Spike Spiegel');
    });

    it('should fetch anime by ID using AniListMediaService', async () => {
        const mockMedia = {
            id: 1,
            title: { romaji: 'Cowboy Bebop', userPreferred: 'Cowboy Bebop' },
            genres: ['Action'],
            studios: { edges: [] },
            tags: [],
            coverImage: { color: '#000000' },
        };
        vi.spyOn(client, 'executeQuery').mockResolvedValueOnce({ Media: mockMedia });

        const service = new AniListMediaService(client);
        const anime = await service.searchAnimeById(1);

        expect(anime.getTitle()).toBe('Cowboy Bebop');
    });

    it('should fetch user entries for affinity using AniListUserService', async () => {
        const mockResult = {
            u1_anime: { lists: [{ entries: [{ mediaId: 1, score: 90 }] }] },
            u2_anime: { lists: [{ entries: [{ mediaId: 1, score: 85 }] }] },
        };
        vi.spyOn(client, 'executeQuery').mockResolvedValueOnce(mockResult);

        const service = new AniListUserService(client);
        const entries = await service.searchEntries(100, 200);

        expect(entries.u1_anime.lists[0].entries[0].score).toBe(90);
    });

    it('should provide complete unified facade via AniListService', async () => {
        const service = new AniListService(client);
        expect(service.characters).toBeDefined();
        expect(service.media).toBeDefined();
        expect(service.users).toBeDefined();
    });
});

