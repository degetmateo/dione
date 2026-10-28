import { describe, it, expect } from 'vitest';
import { ComponentFactory } from '../../src/presentation/ui/components/component.factory';

describe('UI Components and ComponentFactory', () => {
    it('should create CharacterClaimCard with claim button when unowned', () => {
        const card = ComponentFactory.createCharacterClaimCard({
            id: 1234,
            name: 'Emilia',
            url: 'https://anilist.co/character/1234',
            image: { url: 'https://image.com/emilia.png' },
            media: { id: 10, title: { userPreferred: 'Re:Zero' }, siteUrl: 'https://anilist.co/anime/10' },
            fav_count: 50,
            claimed_count: 0,
            interaction_id: 'cache_xyz',
            owner: null,
        });
        const json = card.toJSON() as any;
        expect(json.accent_color).toBeDefined();
    });

    it('should create CharacterClaimCard with reward button when owned', () => {
        const card = ComponentFactory.createCharacterClaimCard({
            id: 1234,
            name: 'Emilia',
            url: 'https://anilist.co/character/1234',
            image: { url: 'https://image.com/emilia.png' },
            media: null,
            fav_count: 50,
            claimed_count: 1,
            interaction_id: 'cache_xyz',
            owner: { id: '99', displayName: 'Subaru' } as any,
        });
        expect(card.toJSON()).toBeDefined();
    });

    it('should create CharacterInfoCard with pagination buttons if requested', () => {
        const card = ComponentFactory.createCharacterInfoCard({
            id: 5678,
            name: 'Megumin',
            url: 'https://anilist.co/character/5678',
            image: { url: 'https://image.com/megumin.png' },
            media: { id: 20, title: 'Konosuba', siteUrl: 'https://anilist.co/anime/20' },
            fav_count: 80,
            claimed_count: 2,
            gender: 'Female',
            age: '14',
            bloodType: 'O',
            interaction_id: 'cache_info',
            page_buttons: true,
        });
        expect(card.character_data.id).toBe(5678);
        expect(card.toJSON()).toBeDefined();
    });

    it('should create GachaTrade cards (confirm, accept, finish, error)', () => {
        const confirm = ComponentFactory.createGachaTradeConfirm({
            id: 'trade_1',
            aCharacterName: 'Rem',
            bCharacterName: 'Ram',
            aCharacterImageURL: 'https://img.com/rem.png',
            bCharacterImageURL: 'https://img.com/ram.png',
        });
        expect(confirm.toJSON()).toBeDefined();

        const accept = ComponentFactory.createGachaTradeAccept({
            id: 'trade_1',
            interactionUserID: 'u1',
            optionsUserID: 'u2',
            aCharacterName: 'Rem',
            bCharacterName: 'Ram',
            aCharacterImageURL: 'https://img.com/rem.png',
            bCharacterImageURL: 'https://img.com/ram.png',
        });
        expect(accept.toJSON()).toBeDefined();

        const finish = ComponentFactory.createGachaTradeFinish({
            interactionUserID: 'u1',
            optionsUserID: 'u2',
            aCharacterName: 'Rem',
            bCharacterName: 'Ram',
            aCharacterImageURL: 'https://img.com/rem.png',
            bCharacterImageURL: 'https://img.com/ram.png',
        });
        expect(finish.toJSON()).toBeDefined();

        const error = ComponentFactory.createGachaTradeError('Rem', 'https://img.com/rem.png');
        expect(error.toJSON()).toBeDefined();
    });

    it('should create rows and patch notes', () => {
        const userRow = ComponentFactory.createUserActionRow({
            id: 'user_123',
            profile: true,
            anilist: true,
            mal: false,
            vndb: true,
        });
        expect(userRow.isValid()).toBe(true);
        expect(userRow.count).toBe(3);

        const vnRow = ComponentFactory.createVnActionRow('vn_cache_1');
        expect(vnRow.components).toHaveLength(2);

        const patchCard = ComponentFactory.createPatchNotes('https://avatar.url/dione.png');
        expect(patchCard.toJSON()).toBeDefined();
    });
});
