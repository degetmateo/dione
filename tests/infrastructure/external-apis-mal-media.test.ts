import { describe, it, expect, vi, afterEach } from 'vitest';
import { MalHttpClient } from '../../src/infrastructure/external-apis/mal/mal-http.client';
import { MalMediaMapper } from '../../src/infrastructure/external-apis/mal/mal-media.mapper';
import { MalMediaService } from '../../src/infrastructure/external-apis/mal/mal-media.service';

describe('MyAnimeList v2 Media Client, Mapper & Service', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should map raw MAL v2 anime payload to Anianime domain model', () => {
        const rawAnime = {
            id: 5114,
            title: 'Fullmetal Alchemist: Brotherhood',
            main_picture: { large: 'https://cdn.myanimelist.net/fmab.jpg', medium: 'https://cdn.myanimelist.net/fmab_m.jpg' },
            alternative_titles: { synonyms: ['FMAB'], en: 'Fullmetal Alchemist: Brotherhood', ja: '鋼の錬金術師' },
            start_date: '2009-04-05',
            end_date: '2010-07-04',
            synopsis: 'Two brothers search for the Philosopher Stone.',
            mean: 9.094,
            rank: 1,
            popularity: 3,
            num_favorites: 246799,
            media_type: 'tv',
            status: 'finished_airing',
            genres: [{ id: 1, name: 'Action' }, { id: 38, name: 'Military' }],
            num_episodes: 64,
            start_season: { year: 2009, season: 'spring' },
            source: 'manga',
            studios: [{ id: 4, name: 'Bones' }],
        };

        const anime = MalMediaMapper.toAnime(rawAnime);
        expect(anime.getProvider()).toBe('MAL');
        expect(anime.getId()).toBe(0);
        expect(anime.getMalId()).toBe(5114);
        expect(anime.getDisplayId()).toBe(5114);
        expect(anime.getFormattedScore()).toBe('9.09/10');
        expect(anime.getFormat()).toBe('TV');
        expect(anime.getStatus()).toBe('FINISHED AIRING');
        expect(anime.getSource()).toBe('MANGA');
        expect(anime.getStudios()).toEqual(['Bones']);
        expect(anime.getSeason()).toBe('SPRING 2009');
        expect(anime.getStartDate()).toBe('5/4/2009');
        expect(anime.getGenres()).toEqual(['Action', 'Military']);
    });

    it('should map raw MAL v2 manga payload with authors and serialization', () => {
        const rawManga = {
            id: 2,
            title: 'Berserk',
            media_type: 'manga',
            status: 'currently_publishing',
            start_date: '1989-08-25',
            mean: 9.47,
            rank: 1,
            popularity: 1,
            num_favorites: 139949,
            num_volumes: 42,
            num_chapters: 0,
            authors: [{ node: { first_name: 'Kentarou', last_name: 'Miura' }, role: 'Story & Art' }],
            serialization: [{ node: { name: 'Young Animal' } }],
            genres: [{ name: 'Action' }, { name: 'Seinen' }],
        };

        const manga = MalMediaMapper.toManga(rawManga);
        expect(manga.getProvider()).toBe('MAL');
        expect(manga.getDisplayId()).toBe(2);
        expect(manga.getAuthors()).toEqual(['Kentarou Miura']);
        expect(manga.getFormattedScore()).toBe('9.47/10');
        expect(manga.getFormat()).toBe('MANGA');
    });

    it('should search MAL v2 by ID, >=3 char query, and <3 char prefix fallback', async () => {
        process.env.MAL_CLIENT_ID = 'test-client-id';
        const client = new MalHttpClient();
        vi.spyOn(client, 'getPublic').mockImplementation(async (endpoint: string) => {
            if (endpoint.startsWith('/anime/14467')) return { id: 14467, title: 'K', mean: 7.45 };
            if (endpoint.startsWith('/manga?q=')) return { data: [{ node: { id: 13, title: 'One Piece', mean: 9.22 } }] };
            return {};
        });
        vi.spyOn(client, 'getPrefixIds').mockResolvedValue([14467]);

        const service = new MalMediaService(client);
        const shortResults = await service.searchAnimeByName('K');
        expect(shortResults).toHaveLength(1);
        expect(shortResults[0].getTitle()).toBe('K');

        const mangas = await service.searchMangaByName('One Piece');
        expect(mangas).toHaveLength(1);
        expect(mangas[0].getTitle()).toBe('One Piece');
    });
});

