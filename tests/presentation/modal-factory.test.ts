import { describe, it, expect } from 'vitest';
import { ModalFactory } from '../../src/presentation/modals/modal.factory';
import { ModalRegistry } from '../../src/presentation/discord/modal-registry';

describe('ModalFactory & ModalRegistry', () => {
    it('should create all modal handlers with unique ids', () => {
        const modals = ModalFactory.createAll();
        expect(modals.length).toBeGreaterThanOrEqual(5);

        const ids = modals.map(m => m.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(modals.length);
    });

    it('should register all modals into registry successfully', () => {
        const registry = new ModalRegistry();
        const modals = ModalFactory.createAll();
        registry.registerAll(modals);

        expect(registry.size()).toBe(modals.length);
        for (const modal of modals) {
            expect(registry.get(modal.id)).toBe(modal);
        }
    });

    it('should return undefined for unregistered modal id', () => {
        const registry = new ModalRegistry();
        expect(registry.get('non-existent-modal')).toBeUndefined();
    });
});

