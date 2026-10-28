import { describe, it, expect, vi } from 'vitest';
import { ButtonRegistry } from '../../src/presentation/discord/button-registry';
import { ButtonDispatcher } from '../../src/presentation/discord/button-dispatcher';
import { ModalRegistry } from '../../src/presentation/discord/modal-registry';
import { ModalDispatcher } from '../../src/presentation/discord/modal-dispatcher';
import { ButtonFactory } from '../../src/presentation/buttons/button.factory';
import { ModalFactory } from '../../src/presentation/modals/modal.factory';
import { InteractionStateService } from '../../src/infrastructure/cache/interaction-state.service';

describe('Button and Modal Execution Integration', () => {
    it('should dispatch to CharacterBackButton and wrap carousel page backwards', async () => {
        const registry = new ButtonRegistry();
        registry.registerAll(ButtonFactory.createAll());
        const dispatcher = new ButtonDispatcher(registry);

        const card0 = { type: 'card0' };
        const card1 = { type: 'card1' };
        const stateKey = InteractionStateService.getInstance().set({
            index: 0,
            cards: [card0, card1],
        });

        const updateFn = vi.fn().mockResolvedValue(undefined);
        const mockInteraction = {
            customId: `character-back-button_${stateKey}`,
            locale: 'es-ES',
            update: updateFn,
            client: { settings: { maintenance: false } },
        } as any;

        await dispatcher.dispatch(mockInteraction);

        expect(updateFn).toHaveBeenCalled();
        const callArgs = updateFn.mock.calls[0][0];
        expect(callArgs.components[0]).toEqual(card1);
    });

    it('should dispatch to CharacterNextButton and wrap carousel page forwards', async () => {
        const registry = new ButtonRegistry();
        registry.registerAll(ButtonFactory.createAll());
        const dispatcher = new ButtonDispatcher(registry);

        const card0 = { type: 'card0' };
        const card1 = { type: 'card1' };
        const stateKey = InteractionStateService.getInstance().set({
            index: 1,
            cards: [card0, card1],
        });

        const updateFn = vi.fn().mockResolvedValue(undefined);
        const mockInteraction = {
            customId: `character-next-button_${stateKey}`,
            locale: 'es-ES',
            update: updateFn,
            client: { settings: { maintenance: false } },
        } as any;

        await dispatcher.dispatch(mockInteraction);

        expect(updateFn).toHaveBeenCalled();
        const callArgs = updateFn.mock.calls[0][0];
        expect(callArgs.components[0]).toEqual(card0);
    });

    it('should reject when modal interaction data is expired', async () => {
        const registry = new ModalRegistry();
        registry.registerAll(ModalFactory.createAll());
        const dispatcher = new ModalDispatcher(registry);

        const replyFn = vi.fn().mockResolvedValue(undefined);
        const mockInteraction = {
            customId: 'setup-instructions-anilist-modal_expiredKey',
            locale: 'es-ES',
            reply: replyFn,
            client: { settings: { maintenance: false } },
        } as any;

        await dispatcher.dispatch(mockInteraction);
        expect(replyFn).toHaveBeenCalled();
        const replyArg = replyFn.mock.calls[0][0];
        expect(replyArg.embeds[0].data.description).toContain('expirado');
    });
});

