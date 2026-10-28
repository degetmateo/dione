import { describe, it, expect, vi } from 'vitest';
import { ButtonRegistry } from '../../src/presentation/discord/button-registry';
import { ButtonDispatcher } from '../../src/presentation/discord/button-dispatcher';
import { ModalRegistry } from '../../src/presentation/discord/modal-registry';
import { ModalDispatcher } from '../../src/presentation/discord/modal-dispatcher';
import { IButtonHandler } from '../../src/presentation/discord/button.interface';
import { IModalHandler } from '../../src/presentation/discord/modal.interface';
import { BusinessRuleError } from '../../src/core/errors';

describe('Button & Modal Dispatchers', () => {
    it('should dispatch to registered button handler with cache data', async () => {
        const registry = new ButtonRegistry();
        const executedWith: any[] = [];

        const mockButton: IButtonHandler = {
            id: 'test-button',
            execute: async (interaction, data) => {
                executedWith.push({ interaction, data });
            },
        };
        registry.register(mockButton);

        const dispatcher = new ButtonDispatcher(registry);
        const mockInteraction = {
            customId: 'test-button_cache123',
            client: {
                settings: { maintenance: false },
                get: (key: string) => ({ user: '123' }),
            },
        } as any;

        await dispatcher.dispatch(mockInteraction);

        expect(executedWith).toHaveLength(1);
        expect(executedWith[0].data).toEqual({ user: '123' });
    });

    it('should throw BusinessRuleError on button click during maintenance', async () => {
        const registry = new ButtonRegistry();
        const dispatcher = new ButtonDispatcher(registry);
        const mockInteraction = {
            customId: 'test-button',
            client: { settings: { maintenance: true } },
        } as any;

        await expect(dispatcher.dispatch(mockInteraction)).rejects.toThrow(BusinessRuleError);
    });

    it('should dispatch to registered modal handler', async () => {
        const registry = new ModalRegistry();
        let called = false;

        const mockModal: IModalHandler = {
            id: 'test-modal',
            execute: async () => {
                called = true;
            },
        };
        registry.register(mockModal);

        const dispatcher = new ModalDispatcher(registry);
        const mockInteraction = {
            customId: 'test-modal',
            client: {
                settings: { maintenance: false },
                get: () => null,
            },
        } as any;

        await dispatcher.dispatch(mockInteraction);
        expect(called).toBe(true);
    });
});

