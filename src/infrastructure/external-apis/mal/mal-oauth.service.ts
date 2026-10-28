import { MalHttpClient } from './mal-http.client';
import { IUserRepository } from '../../../domain/repositories/user-repository.interface';
import { MongoUserRepository } from '../../repositories/mongo-user.repository';

export interface MalTokenResponse {
    token_type: string;
    expires_in: number;
    access_token: string;
    refresh_token: string;
}

export class MalOAuthService {
    private readonly tokenEndpoint = 'https://myanimelist.net/v1/oauth2/token';

    public constructor(
        private readonly client: MalHttpClient,
        private readonly userRepo?: IUserRepository
    ) {}

    public async exchangeCode(code: string, verifier: string): Promise<MalTokenResponse> {
        const body = new URLSearchParams({
            client_id: process.env.MAL_CLIENT_ID || '',
            client_secret: process.env.MAL_CLIENT_TOKEN || '',
            grant_type: 'authorization_code',
            code,
            code_verifier: verifier,
        }).toString();

        return this.client.request<MalTokenResponse>(this.tokenEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
        });
    }

    public async refreshToken(refreshToken: string, discordId?: string): Promise<MalTokenResponse> {
        const body = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: process.env.MAL_CLIENT_ID || '',
            client_secret: process.env.MAL_CLIENT_TOKEN || '',
        }).toString();

        const headers: Record<string, string> = {
            'Content-Type': 'application/x-www-form-urlencoded',
        };
        if (process.env.MAL_CLIENT_TOKEN) {
            headers['Authorization'] = 'Basic ' + process.env.MAL_CLIENT_TOKEN;
        }

        const tokens = await this.client.request<MalTokenResponse>(this.tokenEndpoint, {
            method: 'POST',
            headers,
            body,
        });

        if (discordId) {
            const repo = this.userRepo ?? new MongoUserRepository();
            await repo.updateMalTokens(discordId, tokens);
        }

        return tokens;
    }
}

