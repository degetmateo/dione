import { Client, GatewayIntentBits } from 'discord.js';
import eventsHandler from '../handlers/events.handler';
import SettingsModule, { Settings } from '../modules/settings.module';
import mongo from '../database/mongo';
import { memoryModule } from '../modules/mem.module';
import { CommandRegistry } from '../presentation/discord/command-registry';
import { CommandDispatcher } from '../presentation/discord/command-dispatcher';
import { ButtonRegistry } from '../presentation/discord/button-registry';
import { ButtonDispatcher } from '../presentation/discord/button-dispatcher';
import { ModalRegistry } from '../presentation/discord/modal-registry';
import { ModalDispatcher } from '../presentation/discord/modal-dispatcher';
import { MaintenanceMiddleware } from '../presentation/discord/middlewares/maintenance.middleware';
import { CooldownMiddleware } from '../presentation/discord/middlewares/cooldown.middleware';
import { CommandFactory } from '../presentation/commands/command.factory';
import { ButtonFactory } from '../presentation/buttons/button.factory';
import { ModalFactory } from '../presentation/modals/modal.factory';
import { InteractionCacheService } from '../infrastructure/cache/interaction-cache.service';

class Bot extends Client<true> {
    public readonly commandRegistry = new CommandRegistry();
    public readonly commandDispatcher: CommandDispatcher;
    public readonly buttonRegistry = new ButtonRegistry();
    public readonly buttonDispatcher = new ButtonDispatcher(this.buttonRegistry);
    public readonly modalRegistry = new ModalRegistry();
    public readonly modalDispatcher = new ModalDispatcher(this.modalRegistry);
    public readonly cacheService = new InteractionCacheService();
    public settings = {} as Settings;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildPresences,
            ],
        });

        this.commandRegistry.registerAll(CommandFactory.createAll());
        this.buttonRegistry.registerAll(ButtonFactory.createAll());
        this.modalRegistry.registerAll(ModalFactory.createAll());

        this.commandDispatcher = new CommandDispatcher(this.commandRegistry);
        this.commandDispatcher.use(new MaintenanceMiddleware());
        this.commandDispatcher.use(new CooldownMiddleware(this.commandRegistry));

        eventsHandler.load(this);
    }

    public async fetchUser(id: string) {
        return await this.users.fetch(id);
    }

    public async login(token?: string): Promise<string> {
        this.settings = await SettingsModule.read();
        memoryModule.characters = await mongo.characters.find().toArray();
        return await super.login(token);
    }
}

export default Bot;
