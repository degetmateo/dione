import { describe, it, expect } from 'vitest';
import { EmbedFactory } from '../../src/presentation/ui/embeds/embed.factory';
import { Colors } from 'discord.js';

describe('UI Embeds and EmbedFactory', () => {
    it('should create ErrorEmbed with DarkRed color', () => {
        const embed = EmbedFactory.createError('Ha ocurrido un error');
        expect(embed.data.description).toBe('Ha ocurrido un error');
        expect(embed.data.color).toBe(Colors.DarkRed);
    });

    it('should create SuccessEmbed with Green color', () => {
        const embed = EmbedFactory.createSuccess('Operación exitosa');
        expect(embed.data.description).toBe('Operación exitosa');
        expect(embed.data.color).toBe(Colors.Green);
    });

    it('should create LoadingEmbed with default text and image', () => {
        const embed = EmbedFactory.createLoading();
        expect(embed.data.description).toBe('Espere...');
        expect(embed.data.image?.url).toContain('bar.gif');
    });

    it('should create AffinityEmbed with percentage text', () => {
        const embed = EmbedFactory.createAffinity({
            affinity: 87.54,
            userAId: '12345',
            userBId: '67890',
        });
        expect(embed.data.description).toContain('<@12345>');
        expect(embed.data.description).toContain('<@67890>');
        expect(embed.data.description).toContain('87.54%');
    });

    it('should create HelpEmbed with command descriptions', () => {
        const embed = EmbedFactory.createHelp();
        expect(embed.data.description).toContain('/help');
        expect(embed.data.description).toContain('/setup');
        expect(embed.data.description).toContain('/ch');
    });

    it('should create SetupInstructionsEmbed and SetupSuccessEmbed', () => {
        const instructions = EmbedFactory.createSetupInstructions();
        expect(instructions.data.title).toContain('Instrucciones para vincular ANILIST');

        const success = EmbedFactory.createSetupSuccess('TestUser', 'https://anilist.co/user/TestUser');
        expect(success.data.description).toContain('TestUser');
        expect(success.data.color).toBe(Colors.Green);
    });

    it('should create ChEmbed and CharacterEmbed', () => {
        const ch = EmbedFactory.createCh({
            name: 'Rem',
            site_url: 'https://anilist.co/character/88572',
            image_url: 'https://image.url/rem.png',
            claimed_count: 3,
            user_id: '9999',
        });
        expect(ch.data.title).toBe('Rem');
        expect(ch.data.description).toContain('<@9999>');
        expect(ch.data.footer?.text).toContain('3 veces');

        const character = EmbedFactory.createCharacter({
            id: 88572,
            name: { full: 'Rem', userPreferred: 'Rem' },
            siteUrl: 'https://anilist.co/character/88572',
            favourites: 12000,
            owner_id: '123',
            gender: 'Female',
        });
        expect(character.data.title).toBe('Rem');
        expect(character.data.description).toContain('Pertenece a <@123>');
        expect(character.data.description).toContain('Female');
    });

    it('should create ScoresEmbed with server average and grouped categories', () => {
        const scores = EmbedFactory.createScores([
            {
                user: { type: 'aniuser', id: '1', name: 'Alice' },
                progress: 12,
                repeat: 0,
                score: 90,
                status: 'COMPLETED',
            },
            {
                user: { type: 'maluser', id: '2', name: 'Bob' },
                progress: 5,
                repeat: 0,
                score: 70,
                status: 'CURRENT',
            },
        ]);
        expect(scores.data.description).toContain('Promedio del Servidor: **[90.00]**');
        expect(scores.data.description).toContain('Alice');
        expect(scores.data.description).toContain('Bob');
    });
});

