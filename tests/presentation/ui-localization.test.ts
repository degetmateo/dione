import { describe, it, expect } from 'vitest';
import { ComponentFactory } from '../../src/presentation/ui/components/component.factory';
import { EmbedFactory } from '../../src/presentation/ui/embeds/embed.factory';

describe('UI Localization (i18n)', () => {
    it('should localize CharacterClaimCard buttons in Spanish and English', () => {
        const esCard = ComponentFactory.createCharacterClaimCard({
            id: 1,
            name: 'Artoria',
            url: 'https://artoria.com',
            image: { url: 'https://img.com/artoria.png' },
            media: null,
            fav_count: 10,
            claimed_count: 0,
            interaction_id: 'c1',
            owner: null,
            locale: 'es-ES',
        });
        const esJson = esCard.toJSON() as any;
        const esRow = esJson.components.find((c: any) => c.components);
        expect(esRow.components[0].label).toBe('Reclamar');
        expect(esRow.components[1].label).toBe('Lo quiero');

        const enCard = ComponentFactory.createCharacterClaimCard({
            id: 1,
            name: 'Artoria',
            url: 'https://artoria.com',
            image: { url: 'https://img.com/artoria.png' },
            media: null,
            fav_count: 10,
            claimed_count: 0,
            interaction_id: 'c2',
            owner: null,
            locale: 'en-US',
        });
        const enJson = enCard.toJSON() as any;
        const enRow = enJson.components.find((c: any) => c.components);
        expect(enRow.components[0].label).toBe('Claim');
        expect(enRow.components[1].label).toBe('I want it');
    });

    it('should localize GachaTradeConfirm button in Spanish and English', () => {
        const es = ComponentFactory.createGachaTradeConfirm({
            id: 't1',
            aCharacterName: 'A',
            bCharacterName: 'B',
            aCharacterImageURL: 'https://a.png',
            bCharacterImageURL: 'https://b.png',
            locale: 'es-ES',
        });
        const esJson = es.toJSON() as any;
        const esRow = esJson.components.find((c: any) => c.components);
        expect(esRow.components[0].label).toBe('Confirmar intercambio');

        const en = ComponentFactory.createGachaTradeConfirm({
            id: 't2',
            aCharacterName: 'A',
            bCharacterName: 'B',
            aCharacterImageURL: 'https://a.png',
            bCharacterImageURL: 'https://b.png',
            locale: 'en-US',
        });
        const enJson = en.toJSON() as any;
        const enRow = enJson.components.find((c: any) => c.components);
        expect(enRow.components[0].label).toBe('Confirm trade');
    });

    it('should localize GachaTradeError in Spanish and English', () => {
        const es = ComponentFactory.createGachaTradeError('Kanna', 'https://img.com/kanna.png', 'es-ES');
        expect(JSON.stringify(es.toJSON())).toContain('¡No has reclamado a `Kanna` en este servidor!');

        const en = ComponentFactory.createGachaTradeError('Kanna', 'https://img.com/kanna.png', 'en-US');
        expect(JSON.stringify(en.toJSON())).toContain('You have not claimed `Kanna` on this server!');
    });

    it('should localize AffinityEmbed in Spanish and English', () => {
        const es = EmbedFactory.createAffinity({
            affinity: 75.5,
            userAId: '100',
            userBId: '200',
            locale: 'es-ES',
        });
        expect(es.data.description).toBe('<@100> y <@200> tienen una afinidad del **75.50%**');

        const en = EmbedFactory.createAffinity({
            affinity: 88.2,
            userAId: '100',
            userBId: '200',
            locale: 'en-US',
        });
        expect(en.data.description).toBe('<@100> and <@200> have an affinity of **88.20%**');
    });

    it('should localize ScoresEmbed server average header', () => {
        const es = EmbedFactory.createScores([], 'es-ES');
        expect(es.data.description).toContain('Promedio del Servidor:');

        const en = EmbedFactory.createScores([], 'en-US');
        expect(en.data.description).toContain('Server Average:');
    });
});

