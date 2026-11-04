import { Anianime, MangaModel } from '../../../domain/models';
import Helpers from '../../../helpers';

export class MalMediaMapper {
    private static readonly MAL_COLOR = '#2E51A2';

    public static toAnime(raw: any): Anianime {
        const studios = (raw.studios || []).map((s: any) => s.name).filter(Boolean);
        const season = raw.start_season
            ? `${String(raw.start_season.season || '').toUpperCase()}${raw.start_season.year ? ` ${raw.start_season.year}` : ''}`.trim()
            : '';
        const score = raw.mean ? Number(Number(raw.mean).toFixed(2)) : 0;

        return new Anianime({
            provider: 'MAL', id: 0, idMal: raw.id, scoreScale: 10,
            rank: raw.rank ?? null, studioNames: studios,
            title: this.mapTitle(raw, 'Anime'),
            format: this.formatEnum(raw.media_type),
            status: this.formatEnum(raw.status),
            description: raw.synopsis || '',
            startDate: this.parseDate(raw.start_date),
            endDate: this.parseDate(raw.end_date),
            season, episodes: raw.num_episodes ?? 0, duration: 0,
            source: this.formatEnum(raw.source),
            trailer: { id: '', site: '', thumbnail: '' },
            updatedAt: '',
            coverImage: this.mapCover(raw),
            tags: [], bannerImage: '',
            genres: (raw.genres || []).map((g: any) => g.name).filter(Boolean),
            synonyms: this.extractSynonyms(raw),
            averageScore: score, meanScore: score,
            popularity: raw.popularity ?? 0, favourites: raw.num_favorites ?? 0,
            siteUrl: `https://myanimelist.net/anime/${raw.id}`,
            studios: { edges: studios.map((name: string, i: number) => ({ node: { id: i + 1, name } })) },
        });
    }

    public static toManga(raw: any): MangaModel {
        const serializations = (raw.serialization || []).map((s: any) => s.node?.name || s.name).filter(Boolean);
        const score = raw.mean ? Number(Number(raw.mean).toFixed(2)) : null;

        return new MangaModel({
            provider: 'MAL', id: 0, idMal: raw.id, scoreScale: 10, rank: raw.rank ?? null,
            authors: (raw.authors || []).map((a: any) => this.formatAuthor(a)).filter(Boolean),
            serializations,
            title: this.mapTitle(raw, 'Manga'),
            format: this.formatEnum(raw.media_type) || null,
            status: this.formatEnum(raw.status) || null,
            description: raw.synopsis || null,
            startDate: this.parseDate(raw.start_date),
            chapters: raw.num_chapters || null, volumes: raw.num_volumes || null,
            source: serializations.join(', ') || null,
            coverImage: this.mapCover(raw), bannerImage: null,
            genres: (raw.genres || []).map((g: any) => g.name).filter(Boolean),
            tags: [], meanScore: score, averageScore: score,
            popularity: raw.popularity ?? null, favourites: raw.num_favorites ?? null,
            siteUrl: `https://myanimelist.net/manga/${raw.id}`,
        });
    }

    private static mapTitle(raw: any, fallback: string) {
        const alt = raw.alternative_titles || {};
        return {
            romaji: raw.title || '', english: alt.en || '', native: alt.ja || '',
            userPreferred: raw.title || alt.en || alt.ja || fallback,
        };
    }

    private static mapCover(raw: any) {
        const pic = raw.main_picture || {};
        return { extraLarge: pic.large || '', large: pic.large || '', medium: pic.medium || '', color: this.MAL_COLOR };
    }

    private static extractSynonyms(raw: any): string[] {
        const alt = raw.alternative_titles || {};
        const all = [alt.en, alt.ja, ...(alt.synonyms || [])].filter((s: any) => s && s !== raw.title);
        return Helpers.deleteRepeatedElements(all);
    }

    private static parseDate(iso?: string) {
        if (!iso) return { year: 0, month: 0, day: 0 };
        const [y, m, d] = iso.split('-').map(Number);
        return { year: y || 0, month: m || 1, day: d || 1 };
    }

    private static formatEnum(val?: string): string {
        return val ? String(val).replace(/_/g, ' ').toUpperCase() : '';
    }

    private static formatAuthor(entry: any): string {
        const node = entry?.node || entry;
        const fullName = [node?.first_name, node?.last_name].filter(Boolean).join(' ').trim();
        return fullName || node?.name || '';
    }
}

