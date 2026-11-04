import { BaseHttpClient } from '../http/base-http-client';
import { HttpRequestOptions } from '../http/http-client.interface';
import { ExternalApiError } from '../../../core/errors';

export class MalHttpClient extends BaseHttpClient {
    private readonly baseUrl = 'https://api.myanimelist.net/v2';

    public constructor() {
        super('MyAnimeList', 12000);
    }

    public async execute<T = any>(url: string, options: HttpRequestOptions = {}): Promise<T> {
        const headers = options.headers ?? {};
        if (!headers['Authorization'] && process.env.MAL_CLIENT_TOKEN) {
            headers['Authorization'] = `Bearer ${process.env.MAL_CLIENT_TOKEN}`;
        }
        return this.request<T>(url, { ...options, headers });
    }

    public async getPublic<T = any>(endpoint: string): Promise<T> {
        const clientId = process.env.MAL_CLIENT_ID;
        if (!clientId) {
            throw new ExternalApiError('MyAnimeList', 'MAL_CLIENT_ID is not configured', 500);
        }
        return this.get<T>(`${this.baseUrl}${endpoint}`, { 'X-MAL-CLIENT-ID': clientId });
    }

    public async getPrefixIds(type: 'anime' | 'manga', keyword: string): Promise<number[]> {
        const url = `https://myanimelist.net/search/prefix.json?type=${type}&keyword=${encodeURIComponent(keyword)}`;
        const res = await this.get<any>(url);
        const items = res?.categories?.[0]?.items || [];
        return items.slice(0, 5).map((item: any) => Number(item.id)).filter(Boolean);
    }
}
