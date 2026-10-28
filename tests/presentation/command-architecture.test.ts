import { describe, it, expect, vi } from 'vitest';
import { CommandRegistry } from '../../src/presentation/discord/command-registry';
import { CommandDispatcher } from '../../src/presentation/discord/command-dispatcher';
import { BaseSlashCommand } from '../../src/presentation/discord/base.slash-command';
import { MaintenanceMiddleware } from '../../src/presentation/discord/middlewares/maintenance.middleware';
import { SlashCommandBuilder } from 'discord.js';
import { BusinessRuleError } from '../../src/core/errors/business-rule-error';

class DummyPingCommand extends BaseSlashCommand {
    public readonly name = 'ping';
    public readonly data = new SlashCommandBuilder().setName('ping').setDescription('Ping test');
    public async execute(interaction: any): Promise<void> {
        await interaction.reply('pong');
    }
}

describe('Command Architecture (Registry & Dispatcher)', () => {
    it('should register and retrieve commands', () => {
        const registry = new CommandRegistry();
        const cmd = new DummyPingCommand();
        registry.register(cmd);

        expect(registry.has('ping')).toBe(true);
        expect(registry.get('ping')).toBe(cmd);
        expect(registry.getAll().length).toBe(1);
    });

    it('should dispatch command through pipeline successfully', async () => {
        const registry = new CommandRegistry();
        const cmd = new DummyPingCommand();
        const spyExecute = vi.spyOn(cmd, 'execute');
        registry.register(cmd);

        const dispatcher = new CommandDispatcher(registry);
        const interaction = {
            commandName: 'ping',
            user: { id: 'user1' },
            client: { settings: { maintenance: false } },
            reply: vi.fn(),
            isRepliable: () => true,
        } as any;

        await dispatcher.dispatch(interaction);
        expect(spyExecute).toHaveBeenCalledWith(interaction);
    });

    it('should block execution when maintenance mode is active', async () => {
        const registry = new CommandRegistry();
        const cmd = new DummyPingCommand();
        const spyExecute = vi.spyOn(cmd, 'execute');
        registry.register(cmd);

        const dispatcher = new CommandDispatcher(registry);
        dispatcher.use(new MaintenanceMiddleware());

        const interaction = {
            commandName: 'ping',
            user: { id: 'user1' },
            client: { settings: { maintenance: true } },
            reply: vi.fn(),
            isRepliable: () => true,
            locale: 'es-ES',
        } as any;

        await dispatcher.dispatch(interaction);
        expect(spyExecute).not.toHaveBeenCalled();
        expect(interaction.reply).toHaveBeenCalled(); // Error handled by InteractionErrorHandler
    });
});

