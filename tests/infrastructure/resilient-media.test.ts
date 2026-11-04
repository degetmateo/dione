import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResilientMediaService } from '../../src/infrastructure/external-apis/common/resilient-media.service';
import { CrossPlatformScoresService } from '../../src/infrastructure/external-apis/common/cross-platform-scores.service';
import { BotSettingsService } from '../../src/core/config/bot-settings.service';
import { ExternalApiError } from '../../src/core/errors/external-api-error';
import { MalMediaMapper } from '../../src/infrastructure/external-apis/mal/mal-media.mapper';

describe('ResilientMediaService & CrossPlatformScores Failover', () => {
    let settings: BotSettingsService;
    let mockAnilist: any;
    let mockMal: any;

    beforeEach(() => {
        settings = new BotSettingsService();
        settings.setInMemory({ media_api_provider: 'auto' });

        mockAnilist = {
            media: {
                searchAnimeById: vi.fn(),
                searchAnimeByName: vi.fn(),
                searchMangaById: vi.fn(),
                searchMangaByName: vi.fn(),
            },
            users: { searchScores: vi.fn() },
        };

        mockMal = {
            media: {
                searchAnimeById: vi.fn(),
                searchAnimeByName: vi.fn(),
                searchMangaById: vi.fn(),
                searchMangaByName: vi.fn(),
            },
            users: {
                searchScores: vi.fn().mockResolvedValue([
                    { user: { id: 77, name: 'MalFan' }, my_list_status: { status: 'completed', score: 9, num_episodes_watched: 24 } },
                ]),
            },
        };
    });

    it('should fail over automatically to MAL v2 in auto mode when AniList returns 503', async () => {
        mockAnilist.media.searchAnimeByName.mockRejectedValue(new ExternalApiError('AniList', 'Service Unavailable', 503));
        mockMal.media.searchAnimeByName.mockResolvedValue([MalMediaMapper.toAnime({ id: 20, title: 'Naruto', mean: 8.0 })]);

        const service = new ResilientMediaService(mockAnilist, mockMal, settings);
        const res = await service.searchAnimeByName('Naruto');

        expect(res.fallbackUsed).toBe(true);
        expect(res.provider).toBe('MAL');
        expect(res.data[0].getTitle()).toBe('Naruto');
        expect(service.getStats().failoverCount).toBe(1);
        expect(service.getStats().lastProviderUsed).toBe('MAL');
    });

    it('should NOT fail over to MAL when AniList returns 404 Not Found', async () => {
        mockAnilist.media.searchAnimeById.mockRejectedValue(new ExternalApiError('AniList', 'Not Found', 404));
        const service = new ResilientMediaService(mockAnilist, mockMal, settings);

        await expect(service.searchAnimeById(9999999)).rejects.toThrow(ExternalApiError);
        expect(mockMal.media.searchAnimeById).not.toHaveBeenCalled();
    });

    it('should bypass AniList completely when provider mode is forced to mal', async () => {
        settings.setInMemory({ media_api_provider: 'mal' });
        mockMal.media.searchMangaById.mockResolvedValue(MalMediaMapper.toManga({ id: 2, title: 'Berserk' }));

        const service = new ResilientMediaService(mockAnilist, mockMal, settings);
        const res = await service.searchMangaById(2);

        expect(res.provider).toBe('MAL');
        expect(res.fallbackUsed).toBe(false);
        expect(mockAnilist.media.searchMangaById).not.toHaveBeenCalled();
    });

    it('should skip AniList score query on MAL media (id=0) while still fetching MAL user scores', async () => {
        const scoresService = new CrossPlatformScoresService(mockAnilist, mockMal, settings);
        const members = [
            { preferred_platform: 'anilist', anilist: { id: 101 } },
            { preferred_platform: 'mal', mal: { id: 77, auth: { access_token: 'tok' } } },
        ];

        const scores = await scoresService.searchScores({ type: 'ANIME', id: 0, idMal: 5114 }, members);
        expect(mockAnilist.users.searchScores).not.toHaveBeenCalled();
        expect(mockMal.users.searchScores).toHaveBeenCalledTimes(1);
        expect(scores).toHaveLength(1);
        expect(scores[0].score).toBe(90);
    });
});
