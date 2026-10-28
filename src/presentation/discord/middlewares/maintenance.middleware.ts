import { ChatInputCommandInteraction } from 'discord.js';
import { ICommandMiddleware, NextFunction } from '../middleware.interface';
import { BusinessRuleError } from '../../../core/errors/business-rule-error';
import { I18nService } from '../../../core/i18n/i18n.service';
import Bot from '../../../bot/bot';

export class MaintenanceMiddleware implements ICommandMiddleware {
    public async handle(interaction: ChatInputCommandInteraction, next: NextFunction): Promise<void> {
        const bot = interaction.client as Bot;
        if (bot.settings?.maintenance && interaction.commandName !== 'eval') {
            const message = I18nService.t(interaction.locale, 'common.maintenanceMode');
            throw new BusinessRuleError(message, 'MAINTENANCE_MODE');
        }
        await next();
    }
}

