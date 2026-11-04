import { describe, it, expect, vi, afterEach } from 'vitest';
import { AnimeSearchHandler } from '../../src/presentation/commands/general/media/anime-search.handler';
import { MangaSearchHandler } from '../../src/presentation/commands/general/media/manga-search.handler';
import { EvalCommand } from '../../src/presentation/commands/dev/eval.command';
import { ApiClientFactory } from '../../src/infrastructure/external-apis/api-client.factory';
import { MalMediaMapper } from '../../src/infrastructure/external-apis/mal/mal-media.mapper';
import SettingsModule from '../../src/modules/settings.module';
import mongo from '../../src/database/mongo';

describe('Media Command Handlers & Eval API Switching', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should include localized fallback notice when /anime fails over from AniList to MAL', async () => {
        vi.spyOn(mongo as any, 'memberships', 'get').mockReturnValue({ find: () => ({ toArray: async () => [] }) });
        vi.spyOn(mongo as any, 'users', 'get').mockReturnValue({ find: () => ({ toArray: async () => [] }) });

        const resilient = ApiClientFactory.getResilientMediaService();
        vi.spyOn(resilient, 'searchAnimeById').mockResolvedValue({
            data: MalMediaMapper.toAnime({ id: 5114, title: 'FMA: Brotherhood', mean: 9.1 }),
            provider: 'MAL',
            fallbackUsed: true,
        });

        const editReply = vi.fn().mockResolvedValue(undefined);
        await AnimeSearchHandler.handle({
            locale: 'es-ES', guildId: 'guild-1',
            deferReply: vi.fn().mockResolvedValue(undefined), editReply,
            options: { getString: () => '5114' },
        } as any);

        const payload = editReply.mock.calls[0][0];
        expect(payload.content).toContain('MyAnimeList');
        expect(payload.embeds[0].data.author?.name).toBe('MyAnimeList');
    });

    it('should omit fallback notice when /manga runs intentionally in MAL mode', async () => {
        vi.spyOn(mongo as any, 'memberships', 'get').mockReturnValue({ find: () => ({ toArray: async () => [] }) });
        vi.spyOn(mongo as any, 'users', 'get').mockReturnValue({ find: () => ({ toArray: async () => [] }) });

        const resilient = ApiClientFactory.getResilientMediaService();
        vi.spyOn(resilient, 'searchMangaByName').mockResolvedValue({
            data: [MalMediaMapper.toManga({ id: 2, title: 'Berserk', mean: 9.47 })],
            provider: 'MAL',
            fallbackUsed: false,
        });

        const editReply = vi.fn().mockResolvedValue(undefined);
        await MangaSearchHandler.handle({
            locale: 'en-US', guildId: 'guild-1',
            deferReply: vi.fn().mockResolvedValue(undefined), editReply,
            options: { getString: () => 'Berserk' },
        } as any);

        const payload = editReply.mock.calls[0][0];
        expect(payload.content).toBeUndefined();
        expect(payload.embeds[0].data.title).toBe('Berserk');
        expect(payload.components).toHaveLength(1);
    });

    it('should allow developer to switch media API provider via /eval api mal', async () => {
        process.env.DEV_ID = 'dev-999';
        vi.spyOn(SettingsModule, 'save').mockResolvedValue(undefined as any);
        const reply = vi.fn().mockResolvedValue(undefined);
        const botSettings: any = { media_api_provider: 'auto' };

        const cmd = new EvalCommand();
        await cmd.execute({
            user: { id: 'dev-999' },
            options: { getString: () => 'api mal' },
            client: { settings: botSettings },
            reply,
        } as any);

        expect(botSettings.media_api_provider).toBe('mal');
        expect(reply).toHaveBeenCalledWith(expect.objectContaining({
            content: expect.stringContaining('MAL'),
        }));
    });
});
