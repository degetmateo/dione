import { describe, it, expect } from 'vitest';
import { ButtonFactory } from '../../src/presentation/buttons/button.factory';
import { ButtonRegistry } from '../../src/presentation/discord/button-registry';

describe('ButtonFactory & ButtonRegistry', () => {
    it('should create all button handlers with unique ids', () => {
        const buttons = ButtonFactory.createAll();
        expect(buttons.length).toBeGreaterThanOrEqual(30);

        const ids = buttons.map(b => b.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(buttons.length);
    });

    it('should register all buttons into registry successfully', () => {
        const registry = new ButtonRegistry();
        const buttons = ButtonFactory.createAll();
        registry.registerAll(buttons);

        expect(registry.size()).toBe(buttons.length);
        for (const button of buttons) {
            expect(registry.get(button.id)).toBe(button);
        }
    });

    it('should return undefined for unregistered button id', () => {
        const registry = new ButtonRegistry();
        expect(registry.get('non-existent-button')).toBeUndefined();
    });
});

