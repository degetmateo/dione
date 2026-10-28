import { MalHttpClient } from './mal-http.client';
import { MalOAuthService } from './mal-oauth.service';
import { BusinessRuleError } from '../../../core/errors';

export interface MalAuthContext {
    discordId: string;
    auth: {
        access_token: string;
        refresh_token?: string;
    };
}

export class MalUserService {
    public constructor(
        private readonly client: MalHttpClient,
        private readonly oauth: MalOAuthService
    ) {}

    public async executeWithTokenRefresh<T>(
        discordId: string,
        auth: { access_token: string; refresh_token?: string },
        action: (token: string) => Promise<T>
    ): Promise<T> {
        try {
            return await action(auth.access_token);
        } catch (err: any) {
            const isUnauthorized =
                err.statusCode === 401 ||
                err.status === 401 ||
                /unauthorized|expired/i.test(err.message || '');

            if (isUnauthorized && auth.refresh_token) {
                try {
                    const newTokens = await this.oauth.refreshToken(auth.refresh_token, discordId);
                    auth.access_token = newTokens.access_token;
                    if (newTokens.refresh_token) {
                        auth.refresh_token = newTokens.refresh_token;
                    }
                    return await action(newTokens.access_token);
                } catch {
                    throw new BusinessRuleError(
                        'Tu sesión de MyAnimeList ha expirado o el token es inválido. Usa `/setup` para vincularla nuevamente.',
                        'MAL_TOKEN_EXPIRED'
                    );
                }
            }
            throw err;
        }
    }

    private async fetchUser(url: string, token: string, authContext?: MalAuthContext): Promise<any> {
        if (authContext) {
            return this.executeWithTokenRefresh(authContext.discordId, authContext.auth, (t) =>
                this.client.execute(url, { method: 'GET', headers: { Authorization: `Bearer ${t}` } })
            );
        }
        return this.client.execute(url, { method: 'GET', headers: { Authorization: `Bearer ${token}` } });
    }

    public async getUserMe(token: string, authContext?: MalAuthContext): Promise<any> {
        return this.fetchUser('https://api.myanimelist.net/v2/users/@me', token, authContext);
    }

    public async getUserProfile(token: string, authContext?: MalAuthContext): Promise<any> {
        return this.fetchUser('https://api.myanimelist.net/v2/users/@me?fields=anime_statistics', token, authContext);
    }

    public async searchScores(
        media: { id: number; type: 'ANIME' | 'MANGA' },
        malUsers: Array<{
            _id: string;
            mal: { id: number; name: string; auth: { access_token: string; refresh_token: string } };
        }>
    ): Promise<any[]> {
        const path = media.type === 'ANIME' ? 'anime' : 'manga';
        const url = `https://api.myanimelist.net/v2/${path}/${media.id}?fields=my_list_status`;
        const scores: any[] = [];

        for (const u of malUsers) {
            try {
                const res = await this.executeWithTokenRefresh(u._id, u.mal.auth, (token) =>
                    this.client.execute(url, { method: 'GET', headers: { Authorization: `Bearer ${token}` } })
                );
                if (res?.my_list_status) {
                    res.user = { id: u.mal.id, name: u.mal.name };
                    scores.push(res);
                }
            } catch {
                // Ignore single user failure during batch scores retrieval
            }
        }

        return scores;
    }
}
