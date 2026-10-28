import { describe, it, expect, vi } from 'vitest';
import { ButtonRegistry } from '../../src/presentation/discord/button-registry';
import { ButtonDispatcher } from '../../src/presentation/discord/button-dispatcher';
import { ButtonFactory } from '../../src/presentation/buttons/button.factory';
import { InteractionStateService } from '../../src/infrastructure/cache/interaction-state.service';
import { ApiClientFactory } from '../../src/infrastructure/external-apis/api-client.factory';
import { Aniuser } from '../../src/domain/models';

describe('User Button Navigation (Multi-click Persistence)', () => {
    it('should retain the cache key across multiple sequential button interactions without expiring', async () => {
        const registry = new ButtonRegistry();
        registry.registerAll(ButtonFactory.createAll());
        const dispatcher = new ButtonDispatcher(registry);

        const mockAniUser = new Aniuser({
            name: 'TestUser',
            siteUrl: 'https://anilist.co/user/TestUser',
            avatar: { large: 'http://img.jpg' },
            bannerImage: 'http://banner.jpg',
            createdAt: 1600000000,
            options: { profileColor: 'blue' },
            statistics: {
                anime: { count: 10, meanScore: 8, minutesWatched: 60, episodesWatched: 20, statuses: [], genres: [] },
                manga: { count: 5, meanScore: 7, chaptersRead: 50, volumesRead: 5, statuses: [], genres: [] },
            },
        });
        vi.spyOn(ApiClientFactory.getAniListClient().authorized.get, 'user').mockResolvedValue(mockAniUser);

        const stateKey = InteractionStateService.getInstance().set({
            member: {
                _id: '123',
                anilist: { id: 1, token: 'tok' },
                mal: { id: 2, auth: { access_token: 'mal_tok' } },
                vndb: null,
            },
            user: {
                id: '123',
                username: 'TestUser',
                displayName: 'TestUser',
                avatarURL: () => 'http://avatar.jpg',
                bannerURL: () => 'http://banner.jpg',
                hexAccentColor: '#ffffff',
            },
            embeds: {},
        });

        let updatedComponents: any[] = [];
        const createInteraction = (customId: string) => ({
            customId,
            locale: 'es-ES',
            update: vi.fn().mockImplementation(({ components }) => {
                updatedComponents = components;
            }),
            client: { settings: { maintenance: false } },
        } as any);

        // 1st click: user-default-button
        const i1 = createInteraction(`user-default-button_${stateKey}`);
        await dispatcher.dispatch(i1);
        expect(i1.update).toHaveBeenCalledTimes(1);
        const row1 = updatedComponents[0];
        row1.components.forEach((btn: any) => {
            expect(btn.data.custom_id).toContain(`_${stateKey}`);
            expect(btn.data.custom_id).not.toContain('_undefined');
        });

        // 2nd click: user-anilist-button using the generated custom_id from click 1
        const anilistBtn = row1.components.find((b: any) => b.data.custom_id.startsWith('user-anilist-button'));
        const i2 = createInteraction(anilistBtn.data.custom_id);
        await dispatcher.dispatch(i2);
        expect(i2.update).toHaveBeenCalledTimes(1);
        const row2 = updatedComponents[0];
        row2.components.forEach((btn: any) => {
            expect(btn.data.custom_id).toContain(`_${stateKey}`);
            expect(btn.data.custom_id).not.toContain('_undefined');
        });

        // 3rd click: user-default-button using the generated custom_id from click 2
        const defaultBtn = row2.components.find((b: any) => b.data.custom_id.startsWith('user-default-button'));
        const i3 = createInteraction(defaultBtn.data.custom_id);
        await dispatcher.dispatch(i3);
        expect(i3.update).toHaveBeenCalledTimes(1);

        // Verify session still exists and has not expired
        const persistedData: any = InteractionStateService.getInstance().get(stateKey);
        expect(persistedData).toBeDefined();
        expect(persistedData.member._id).toBe('123');
    });
});
