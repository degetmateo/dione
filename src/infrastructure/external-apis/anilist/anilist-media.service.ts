import { AniListHttpClient } from './anilist-http.client';
import { Anianime } from '../../../domain/models';

export class AniListMediaService {
    public constructor(private readonly client: AniListHttpClient) {}

    private readonly mediaFields = `
        id idMal title { romaji english native userPreferred }
        type format status description
        startDate { year month day } endDate { year month day }
        season episodes duration chapters volumes source
        trailer { id site thumbnail } updatedAt
        coverImage { extraLarge large medium color }
        tags { name isMediaSpoiler } bannerImage genres synonyms
        averageScore meanScore popularity favourites
        studios { edges { node { id name } } } siteUrl
    `;

    public async searchAnimeById(id: number | string): Promise<Anianime> {
        const query = `query { Media (id: ${id}, type: ANIME) { ${this.mediaFields} } }`;
        const data = await this.client.executeQuery<{ Media: any }>(query);
        return new Anianime(data.Media);
    }

    public async searchAnimeByName(name: string): Promise<Anianime[]> {
        const safe = name.replace(/"/g, '\\"');
        const query = `query { Page (page: 1, perPage: 10) { media (search: "${safe}", type: ANIME) { ${this.mediaFields} } } }`;
        const data = await this.client.executeQuery<{ Page: { media: any[] } }>(query);
        return (data.Page?.media || []).map(m => new Anianime(m));
    }

    public async searchMangaById(id: number | string): Promise<any> {
        const query = `query { Media (id: ${id}, type: MANGA) { ${this.mediaFields} } }`;
        const data = await this.client.executeQuery<{ Media: any }>(query);
        return data.Media;
    }

    public async searchMangaByName(name: string): Promise<{ media: any[] }> {
        const safe = name.replace(/"/g, '\\"');
        const query = `query { Page (page: 1, perPage: 10) { media (search: "${safe}", type: MANGA) { ${this.mediaFields} } } }`;
        const data = await this.client.executeQuery<{ Page: { media: any[] } }>(query);
        return { media: data.Page?.media || [] };
    }

    public async getRandomPlanning(userId: number | string, type: 'ANIME' | 'MANGA'): Promise<any[]> {
        const query = `
            query {
                media: Page (page: 1, perPage: 100) {
                    results: mediaList (userId: ${userId}, status: PLANNING, type: ${type.toUpperCase()}) {
                        data: media { ${this.mediaFields} }
                    }
                }
            }
        `;
        const response = await this.client.executeQuery<{ media: { results: any[] } }>(query);
        return response.media.results;
    }
}
