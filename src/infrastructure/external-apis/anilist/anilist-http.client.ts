import { BaseHttpClient } from '../http/base-http-client';
import { ExternalApiError } from '../../../core/errors';

export class AniListHttpClient extends BaseHttpClient {
    private readonly apiUrl = 'https://graphql.anilist.co';

    public constructor() {
        super('AniList', 12000);
    }

    public async executeQuery<T = any>(query: string, token?: string): Promise<T> {
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await this.post<{ data: T; errors?: Array<{ message: string; status?: number }> }>(
            this.apiUrl,
            { query },
            headers
        );

        if (res.errors?.length) {
            const err = res.errors[0];
            throw new ExternalApiError('AniList', err.message, err.status || 400);
        }

        return res.data;
    }
}

