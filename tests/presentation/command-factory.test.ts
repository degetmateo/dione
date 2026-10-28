import { describe, it, expect } from 'vitest';
import { CommandFactory } from '../../src/presentation/commands/command.factory';

describe('CommandFactory', () => {
    it('should create all registered commands with valid names and builders', () => {
        const commands = CommandFactory.createAll();
        expect(commands.length).toBe(16);

        const commandNames = commands.map(c => c.name);
        expect(commandNames).toContain('help');
        expect(commandNames).toContain('affinity');
        expect(commandNames).toContain('ch');
        expect(commandNames).toContain('gacha');
        expect(commandNames).toContain('anime');
        expect(commandNames).toContain('manga');
        expect(commandNames).toContain('vn');
        expect(commandNames).toContain('user');
        expect(commandNames).toContain('setup');
        expect(commandNames).toContain('unsetup');

        for (const cmd of commands) {
            expect(cmd.data).toBeDefined();
            expect(cmd.data.name).toBe(cmd.name);
            expect(typeof cmd.execute).toBe('function');
        }
    });
});

