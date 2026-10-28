import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VndbHttpClient } from '../../src/infrastructure/external-apis/vndb/vndb-http.client';
import { VndbService } from '../../src/infrastructure/external-apis/vndb/vndb.service';
import { ExternalApiError } from '../../src/core/errors';

describe('VNDB Services and Client', () => {
    let client: VndbHttpClient;

    beforeEach(() => {
        client = new VndbHttpClient();
    });

    it('should validate token and fetch authinfo in VndbService', async () => {
        vi.spyOn(client, 'execute').mockResolvedValueOnce({
            id: 'u123',
            username: 'VnReader',
            permissions: ['listread'],
        });

        const service = new VndbService(client);
        const auth = await service.auth('test_token');

        expect(auth.username).toBe('VnReader');
        expect(auth.id).toBe('u123');
    });

    it('should search visual novels in VndbService', async () => {
        const mockResults = [
            {
                id: 'v17',
                title: 'Ever17',
                image: { sexual: 0, violence: 0, url: 'https://img.com/ever17.jpg' },
                screenshots: [],
                tags: [],
                aliases: [],
                languages: ['ja', 'en'],
                platforms: ['win'],
            },
        ];

        vi.spyOn(client, 'execute').mockResolvedValueOnce({
            more: false,
            results: mockResults,
        });

        const service = new VndbService(client);
        const res = await service.vn('Ever17');

        expect(res.results).toHaveLength(1);
        expect(res.results[0].title).toBe('Ever17');
    });

    it('should throw ExternalApiError on failure', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: false,
            status: 503,
            statusText: 'Service Unavailable',
            json: async () => ({ msg: 'VNDB Maintenance' }),
        } as any);

        await expect(client.execute('https://api.vndb.org/kana/vn')).rejects.toThrow(
            ExternalApiError
        );
    });
});

