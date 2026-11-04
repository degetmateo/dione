import { MalHttpClient } from './mal-http.client';
import { MalMediaMapper } from './mal-media.mapper';
import { Anianime, MangaModel } from '../../../domain/models';
import { ExternalApiError } from '../../../core/errors';

const ANIME_FIELDS = [
    'id', 'title', 'main_picture', 'alternative_titles', 'start_date', 'end_date',
    'synopsis', 'mean', 'rank', 'popularity', 'num_list_users', 'num_favorites',
    'media_type', 'status', 'genres', 'num_episodes', 'start_season', 'source', 'studios',
].join(',');

const MANGA_FIELDS = [
    'id', 'title', 'main_picture', 'alternative_titles', 'start_date', 'end_date',
    'synopsis', 'mean', 'rank', 'popularity', 'num_list_users', 'num_favorites',
    'media_type', 'status', 'genres', 'num_volumes', 'num_chapters',
    'authors{first_name,last_name}', 'serialization{name}',
].join(',');

export class MalMediaService {
    public constructor(private readonly client: MalHttpClient) {}

    public async searchAnimeById(id: number | string): Promise<Anianime> {
        const raw = await this.client.getPublic<any>(`/anime/${encodeURIComponent(String(id))}?fields=${ANIME_FIELDS}`);
        if (!raw?.id) throw new ExternalApiError('MyAnimeList', 'Anime not found', 404);
        return MalMediaMapper.toAnime(raw);
    }

    public async searchAnimeByName(name: string): Promise<Anianime[]> {
        const trimmed = name.trim();
        if (trimmed.length < 3) {
            const ids = await this.client.getPrefixIds('anime', trimmed);
            const items = await Promise.all(ids.map(id => this.searchAnimeById(id).catch(() => null)));
            return items.filter((item): item is Anianime => item !== null);
        }
        const q = encodeURIComponent(trimmed);
        const res = await this.client.getPublic<{ data: Array<{ node: any }> }>(`/anime?q=${q}&limit=10&fields=${ANIME_FIELDS}`);
        return (res?.data || []).map(item => MalMediaMapper.toAnime(item.node));
    }

    public async searchMangaById(id: number | string): Promise<MangaModel> {
        const raw = await this.client.getPublic<any>(`/manga/${encodeURIComponent(String(id))}?fields=${MANGA_FIELDS}`);
        if (!raw?.id) throw new ExternalApiError('MyAnimeList', 'Manga not found', 404);
        return MalMediaMapper.toManga(raw);
    }

    public async searchMangaByName(name: string): Promise<MangaModel[]> {
        const trimmed = name.trim();
        if (trimmed.length < 3) {
            const ids = await this.client.getPrefixIds('manga', trimmed);
            const items = await Promise.all(ids.map(id => this.searchMangaById(id).catch(() => null)));
            return items.filter((item): item is MangaModel => item !== null);
        }
        const q = encodeURIComponent(trimmed);
        const res = await this.client.getPublic<{ data: Array<{ node: any }> }>(`/manga?q=${q}&limit=10&fields=${MANGA_FIELDS}`);
        return (res?.data || []).map(item => MalMediaMapper.toManga(item.node));
    }
}

