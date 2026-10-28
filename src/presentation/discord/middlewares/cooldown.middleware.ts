import { ChatInputCommandInteraction, Collection } from 'discord.js';
import { ICommandMiddleware, NextFunction } from '../middleware.interface';
import { CommandRegistry } from '../command-registry';
import { BusinessRuleError } from '../../../core/errors/business-rule-error';
import { I18nService } from '../../../core/i18n/i18n.service';

export class CooldownMiddleware implements ICommandMiddleware {
    private readonly timestamps = new Collection<string, Collection<string, number>>();

    constructor(private readonly registry: CommandRegistry) {}

    public async handle(interaction: ChatInputCommandInteraction, next: NextFunction): Promise<void> {
        const command = this.registry.get(interaction.commandName);
        if (!command) {
            return next();
        }

        const commandName = command.name;
        if (!this.timestamps.has(commandName)) {
            this.timestamps.set(commandName, new Collection());
        }

        const now = Date.now();
        const commandTimestamps = this.timestamps.get(commandName)!;
        const cooldownMs = (command.cooldown ?? 3) * 1000;
        const userId = interaction.user.id;

        if (commandTimestamps.has(userId)) {
            const expirationTime = commandTimestamps.get(userId)! + cooldownMs;
            if (now < expirationTime) {
                const remainingSeconds = Math.ceil((expirationTime - now) / 1000);
                const message = I18nService.t(interaction.locale, 'common.cooldownRemaining', {
                    seconds: remainingSeconds,
                });
                throw new BusinessRuleError(message, 'COOLDOWN_ACTIVE');
            }
        }

        commandTimestamps.set(userId, now);
        setTimeout(() => commandTimestamps.delete(userId), cooldownMs);

        await next();
    }
}

