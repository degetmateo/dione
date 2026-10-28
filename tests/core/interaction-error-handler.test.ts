import { describe, it, expect, vi } from 'vitest';
import { InteractionErrorHandler } from '../../src/core/resilience/interaction-error-handler';
import { ExternalApiError, DatabaseError } from '../../src/core/errors';

describe('InteractionErrorHandler', () => {
    it('should reply with ExternalApiError details in Spanish when interaction locale is es-ES', async () => {
        const replyMock = vi.fn().mockResolvedValue(undefined);
        const interaction = {
            isRepliable: () => true,
            replied: false,
            deferred: false,
            locale: 'es-ES',
            reply: replyMock,
        } as any;

        const error = new ExternalApiError('AniList', 'Timeout after 10000ms');
        await InteractionErrorHandler.handle(interaction, error);

        expect(replyMock).toHaveBeenCalledTimes(1);
        const payload = replyMock.mock.calls[0][0];
        expect(payload.embeds[0].data.title).toBe('⚠️ Servicio AniList no disponible');
        expect(payload.embeds[0].data.description).toContain('no está disponible en este momento');
    });

    it('should reply with ExternalApiError details in English when interaction locale is en-US', async () => {
        const replyMock = vi.fn().mockResolvedValue(undefined);
        const interaction = {
            isRepliable: () => true,
            replied: false,
            deferred: false,
            locale: 'en-US',
            reply: replyMock,
        } as any;

        const error = new ExternalApiError('AniList', 'Timeout after 10000ms');
        await InteractionErrorHandler.handle(interaction, error);

        expect(replyMock).toHaveBeenCalledTimes(1);
        const payload = replyMock.mock.calls[0][0];
        expect(payload.embeds[0].data.title).toBe('⚠️ Service AniList unavailable');
        expect(payload.embeds[0].data.description).toContain('currently unavailable');
    });

    it('should editReply when interaction was already deferred and show localized DatabaseError', async () => {
        const editReplyMock = vi.fn().mockResolvedValue(undefined);
        const interaction = {
            isRepliable: () => true,
            replied: false,
            deferred: true,
            locale: 'en-US',
            editReply: editReplyMock,
        } as any;

        const error = new DatabaseError('Mongo connection dropped');
        await InteractionErrorHandler.handle(interaction, error);

        expect(editReplyMock).toHaveBeenCalledTimes(1);
        const payload = editReplyMock.mock.calls[0][0];
        expect(payload.embeds[0].data.title).toBe('💾 Database Error');
        expect(payload.embeds[0].data.description).toContain('temporary database error occurred');
    });

    it('should not throw if Discord reply fails', async () => {
        const replyMock = vi.fn().mockRejectedValue(new Error('Unknown Interaction'));
        const interaction = {
            isRepliable: () => true,
            replied: false,
            deferred: false,
            locale: 'es-ES',
            reply: replyMock,
        } as any;

        await expect(InteractionErrorHandler.handle(interaction, new Error('Random error'))).resolves.not.toThrow();
    });
});
