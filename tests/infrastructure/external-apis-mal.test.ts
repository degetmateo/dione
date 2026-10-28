import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MalHttpClient } from '../../src/infrastructure/external-apis/mal/mal-http.client';
import { MalOAuthService } from '../../src/infrastructure/external-apis/mal/mal-oauth.service';
import { MalUserService } from '../../src/infrastructure/external-apis/mal/mal-user.service';
import { MalService } from '../../src/infrastructure/external-apis/mal/mal.service';
import { ExternalApiError, BusinessRuleError } from '../../src/core/errors';

describe('MyAnimeList Services and Client', () => {
    let client: MalHttpClient;

    beforeEach(() => {
        client = new MalHttpClient();
    });

    it('should exchange code and refresh tokens in MalOAuthService', async () => {
        vi.spyOn(client, 'request').mockResolvedValue({
            access_token: 'acc_123',
            refresh_token: 'ref_123',
            expires_in: 3600,
            token_type: 'Bearer',
        });

        const mockRepo = { updateMalTokens: vi.fn().mockResolvedValue(undefined) } as any;
        const oauth = new MalOAuthService(client, mockRepo);
        const tokens = await oauth.refreshToken('ref_old', 'discord_123');

        expect(tokens.access_token).toBe('acc_123');
        expect(mockRepo.updateMalTokens).toHaveBeenCalledWith('discord_123', tokens);
    });

    it('should automatically refresh token on 401 and retry action successfully', async () => {
        const oauth = new MalOAuthService(client);
        vi.spyOn(oauth, 'refreshToken').mockResolvedValueOnce({
            access_token: 'fresh_token',
            refresh_token: 'fresh_refresh',
            expires_in: 3600,
            token_type: 'Bearer',
        });

        const userService = new MalUserService(client, oauth);
        const auth = { access_token: 'expired_token', refresh_token: 'valid_refresh' };
        let attempts = 0;
        const result = await userService.executeWithTokenRefresh('user_123', auth, async (token) => {
            attempts++;
            if (token === 'expired_token') throw new ExternalApiError('MyAnimeList', 'Unauthorized', 401);
            return { success: true, token };
        });

        expect(attempts).toBe(2);
        expect(result).toEqual({ success: true, token: 'fresh_token' });
        expect(auth.access_token).toBe('fresh_token');
        expect(auth.refresh_token).toBe('fresh_refresh');
    });

    it('should throw BusinessRuleError if token refresh fails on 401', async () => {
        const oauth = new MalOAuthService(client);
        vi.spyOn(oauth, 'refreshToken').mockRejectedValueOnce(new Error('Invalid refresh token'));

        const userService = new MalUserService(client, oauth);
        const auth = { access_token: 'expired_token', refresh_token: 'bad_refresh' };

        await expect(
            userService.executeWithTokenRefresh('user_123', auth, async () => {
                throw new ExternalApiError('MyAnimeList', 'Unauthorized', 401);
            })
        ).rejects.toThrow(BusinessRuleError);
    });

    it('should provide full facade via MalService with auto-refresh', async () => {
        const service = new MalService(client);
        vi.spyOn(service.users, 'getUserProfile').mockResolvedValueOnce({ id: 1, name: 'Otaku' });

        const profile = await service.user.get({
            token: 'tok_abc',
            discordId: 'u123',
            auth: { access_token: 'tok_abc', refresh_token: 'ref_abc' },
        });

        expect(profile.name).toBe('Otaku');
        expect(service.users.getUserProfile).toHaveBeenCalledWith('tok_abc', {
            discordId: 'u123',
            auth: { access_token: 'tok_abc', refresh_token: 'ref_abc' },
        });
    });
});
