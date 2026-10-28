import { BaseHttpClient } from '../http/base-http-client';
import { HttpRequestOptions } from '../http/http-client.interface';

export class MalHttpClient extends BaseHttpClient {
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
}

