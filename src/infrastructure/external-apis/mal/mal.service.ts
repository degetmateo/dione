import { MalHttpClient } from './mal-http.client';
import { MalOAuthService } from './mal-oauth.service';
import { MalUserService, MalAuthContext } from './mal-user.service';

export interface MalUserGetOptions {
    id?: number;
    token: string;
    discordId?: string;
    auth?: { access_token: string; refresh_token?: string };
}

export class MalService {
    public readonly client: MalHttpClient;
    public readonly oauth: MalOAuthService;
    public readonly users: MalUserService;

    public constructor(client?: MalHttpClient) {
        this.client = client ?? new MalHttpClient();
        this.oauth = new MalOAuthService(this.client);
        this.users = new MalUserService(this.client, this.oauth);
    }

    public async request(uri: string, options?: any): Promise<any> {
        return this.client.execute(uri, options);
    }

    public async refresh(refreshToken: string, discordId: string): Promise<any> {
        return this.oauth.refreshToken(refreshToken, discordId);
    }

    public async token(code: string, verifier: string): Promise<any> {
        return this.oauth.exchangeCode(code, verifier);
    }

    public async executeAuthorized<T>(
        discordId: string,
        auth: { access_token: string; refresh_token?: string },
        action: (token: string) => Promise<T>
    ): Promise<T> {
        return this.users.executeWithTokenRefresh(discordId, auth, action);
    }

    public readonly user = {
        me: async (token: string, authContext?: MalAuthContext) => this.users.getUserMe(token, authContext),
        get: async (data: MalUserGetOptions) => {
            const authContext = data.discordId && data.auth ? { discordId: data.discordId, auth: data.auth } : undefined;
            return this.users.getUserProfile(data.token, authContext);
        },
    };

    public readonly search = {
        scores: async (media: { id: number; type: 'ANIME' | 'MANGA' }, malUsers: any[]) =>
            this.users.searchScores(media, malUsers),
    };
}
