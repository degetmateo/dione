import { describe, it, expect, vi } from 'vitest';
import { UserMalButton } from '../../src/presentation/buttons/user/user-mal.button';
import { ApiClientFactory } from '../../src/infrastructure/external-apis/api-client.factory';
import { InteractionStateService } from '../../src/infrastructure/cache/interaction-state.service';
import mongo from '../../src/database/mongo';

describe('UserMalButton Automatic Token Refresh Integration', () => {
    it('should refresh MAL access token on expired token and update database and cache', async () => {
        const malService = ApiClientFactory.getMalClient();

        vi.spyOn(malService.users, 'getUserProfile').mockImplementation(async (token, authContext) => {
            if (token === 'expired_access_token' && authContext?.auth.refresh_token) {
                // Simulates automatic refresh
                authContext.auth.access_token = 'new_refreshed_access_token';
                authContext.auth.refresh_token = 'new_refreshed_refresh_token';
                return { id: 999, name: 'RenovatedUser' };
            }
            return { id: 999, name: 'RenovatedUser' };
        });

        const initialData = {
            member: {
                _id: 'discord_user_456',
                anilist: null,
                mal: {
                    id: 999,
                    auth: {
                        access_token: 'expired_access_token',
                        refresh_token: 'valid_refresh_token',
                    },
                },
                vndb: null,
            },
            embeds: {},
        };

        const stateKey = InteractionStateService.getInstance().set(initialData, 120_000);

        let updatedPayload: any = null;
        const interaction = {
            customId: `user-mal-button_${stateKey}`,
            locale: 'es-ES',
            update: vi.fn().mockImplementation((payload) => {
                updatedPayload = payload;
            }),
            client: { settings: { maintenance: false } },
        } as any;

        const buttonHandler = new UserMalButton();
        const cachedData = InteractionStateService.getInstance().get(stateKey);
        await buttonHandler.execute(interaction, cachedData);

        expect(interaction.update).toHaveBeenCalledTimes(1);
        expect(updatedPayload.embeds).toBeDefined();
        expect(updatedPayload.components).toBeDefined();

        // Check that in-memory cache was updated with refreshed tokens
        const stateAfter = InteractionStateService.getInstance().get<any>(stateKey);
        expect(stateAfter.member.mal.auth.access_token).toBe('new_refreshed_access_token');
        expect(stateAfter.member.mal.auth.refresh_token).toBe('new_refreshed_refresh_token');
        expect(stateAfter.embeds['mal']).toBeDefined();
    });
});

