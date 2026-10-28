import { VndbHttpClient } from './vndb-http.client';
import Helpers from '../../../helpers';
import { T_VN } from '../../../domain/models';

export class VndbService {
    public readonly client: VndbHttpClient;
    private readonly baseUrl = 'https://api.vndb.org/kana';

    public constructor(client?: VndbHttpClient) {
        this.client = client ?? new VndbHttpClient();
    }

    public async auth(token: string): Promise<{ id: string; username: string; permissions: string[] }> {
        return this.client.execute(`${this.baseUrl}/authinfo`, {
            method: 'GET',
            headers: { Authorization: `token ${token}` },
        });
    }

    public async vn(args: string): Promise<{ more: boolean; results: T_VN[] }> {
        const isNum = Helpers.isNumber(args);
        return this.client.execute(`${this.baseUrl}/vn`, {
            method: 'POST',
            body: {
                results: 5,
                page: 1,
                filters: [isNum ? 'id' : 'search', '=', args],
                fields:
                    'title, aliases, olang, devstatus, released, languages, platforms, length_votes, length_minutes, description, average, rating, votecount, image.url, image.thumbnail, image.sexual, image.violence, tags.name, screenshots.url, screenshots.votecount, screenshots.sexual, screenshots.violence',
            },
        });
    }

    public async user(user: { id: string; token: string }): Promise<any> {
        return this.client.execute(`${this.baseUrl}/ulist`, {
            method: 'POST',
            headers: { Authorization: `token ${user.token}` },
            body: {
                user: user.id,
                filters: [],
                fields: 'vote, vn.title, vn.length, vn.tags.name, vn.tags.category',
                results: 100,
            },
        });
    }

    public async score(params: { userId: string; userToken: string; vnId: string }): Promise<any> {
        return this.client.execute(`${this.baseUrl}/ulist`, {
            method: 'POST',
            headers: { Authorization: `token ${params.userToken}` },
            body: {
                user: params.userId,
                filters: ['id', '=', params.vnId],
                fields: 'vote, labels.id, labels.label',
            },
        });
    }

    public async scores(
        members: Array<{ userId: string; username: string; userToken: string; vnId: string }>
    ): Promise<Array<{ id: string; username: string; vote: number; status: string }>> {
        const scores: Array<{ id: string; username: string; vote: number; status: string }> = [];
        const statusMap: Record<number, string> = {
            1: 'PLAYING',
            2: 'FINISHED',
            3: 'PAUSED',
            4: 'DROPPED',
            5: 'SIN ASIGNAR',
        };

        for (const m of members) {
            try {
                const res = await this.score(m);
                const item = res?.results?.[0];
                if (!item) continue;
                const label = (item.labels || []).find((l: any) => l.id <= 4);
                scores.push({
                    id: m.userId,
                    username: m.username,
                    vote: Number(item.vote || 0),
                    status: label ? statusMap[label.id] || 'UNKNOWN' : 'UNKNOWN',
                });
            } catch {
                continue;
            }
        }
        return scores;
    }

    public async request(uri: string, options: any): Promise<any> {
        return this.client.execute(uri, options);
    }
}

