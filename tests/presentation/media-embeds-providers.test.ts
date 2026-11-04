import { describe, it, expect } from 'vitest';
import { AnimeEmbed } from '../../src/presentation/ui/embeds/media/anime.embed';
import { MangaEmbed } from '../../src/presentation/ui/embeds/media/manga.embed';
import { MalMediaMapper } from '../../src/infrastructure/external-apis/mal/mal-media.mapper';
import { Anianime } from '../../src/domain/models';

describe('AnimeEmbed & MangaEmbed Multi-Provider Rendering', () => {
    it('should render AniList AnimeEmbed including single-studio edge case', () => {
        const aniAnime = new Anianime({
            id: 1535, idMal: 1535,
            title: { romaji: 'Death Note', english: 'Death Note', native: 'デスノート', userPreferred: 'Death Note' },
            format: 'TV', status: 'FINISHED', description: '<b>Light Yagami</b> finds a notebook.',
            startDate: { year: 2006, month: 10, day: 4 }, endDate: { year: 2007, month: 6, day: 27 },
            season: 'FALL', episodes: 37, duration: 23, source: 'MANGA',
            trailer: { id: '', site: '', thumbnail: '' }, updatedAt: '',
            coverImage: { extraLarge: 'https://img/dn.jpg', large: '', medium: '', color: '#ff0000' },
            tags: [{ name: 'Detective', isMediaSpoiler: false }, { name: 'SecretSpoiler', isMediaSpoiler: true }],
            bannerImage: '', genres: ['Mystery', 'Thriller'], synonyms: ['DN'],
            averageScore: 84, meanScore: 84, popularity: 500000, favourites: 40000,
            siteUrl: 'https://anilist.co/anime/1535',
            studios: { edges: [{ node: { id: 11, name: 'Madhouse' } }] },
        });

        const embed = new AnimeEmbed(aniAnime, 'es-ES');
        expect(embed.data.author?.name).toBe('AniList');
        expect(embed.data.fields?.[0].value).toContain('**ID**: `1535`');
        expect(embed.data.fields?.[1].value).toContain('`84/100`');
        expect(embed.data.fields?.[3].value).toContain('Madhouse');
        expect(embed.data.fields?.[4].name).toBe('Etiquetas');
        expect(embed.data.fields?.[4].value).not.toContain('SecretSpoiler');
    });

    it('should render MAL v2 AnimeEmbed & MangaEmbed cleanly without empty tags field', () => {
        const malAnime = MalMediaMapper.toAnime({
            id: 9253, title: 'Steins;Gate', media_type: 'tv', source: 'visual_novel',
            num_episodes: 24, status: 'finished_airing', mean: 9.07, rank: 3,
            popularity: 14, num_favorites: 190000,
            studios: [{ name: 'White Fox' }],
            genres: [{ name: 'Sci-Fi' }, { name: 'Time Travel' }],
        });

        const animeEmbed = new AnimeEmbed(malAnime, 'en-US');
        expect(animeEmbed.data.author?.name).toBe('MyAnimeList');
        expect(animeEmbed.data.fields?.[0].value).toContain('**ID (MAL)**: `9253`');
        expect(animeEmbed.data.fields?.[1].value).toContain('`9.07/10`');
        expect(animeEmbed.data.fields?.[1].value).toContain('**Rank**: `#3`');
        expect(animeEmbed.data.fields).toHaveLength(4);

        const malManga = MalMediaMapper.toManga({
            id: 1, title: 'Monster', media_type: 'manga', num_chapters: 162, num_volumes: 18,
            status: 'finished', mean: 9.15, rank: 5, popularity: 28,
            authors: [{ node: { first_name: 'Naoki', last_name: 'Urasawa' } }],
            genres: [{ name: 'Mystery' }, { name: 'Seinen' }],
        });

        const mangaEmbed = new MangaEmbed(malManga, 'es-ES');
        expect(mangaEmbed.data.author?.name).toBe('MyAnimeList');
        expect(mangaEmbed.data.fields?.[0].value).toContain('`9.15/10`');
        expect(mangaEmbed.data.fields?.[1].value).toContain('**ID (MAL)**: `1`');
        expect(mangaEmbed.data.fields?.[1].value).toContain('**Autores**: `Naoki Urasawa`');
        expect(mangaEmbed.data.fields).toHaveLength(3);
    });
});
