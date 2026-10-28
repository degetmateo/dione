import { ModalSubmitInteraction } from 'discord.js';
import { ModalRegistry } from './modal-registry';
import Bot from '../../bot/bot';
import { BusinessRuleError } from '../../core/errors';
import { I18nService } from '../../core/i18n/i18n.service';
import { InteractionStateService } from '../../infrastructure/cache/interaction-state.service';

export class ModalDispatcher {
    public constructor(private readonly registry: ModalRegistry) {}

    public async dispatch(interaction: ModalSubmitInteraction): Promise<void> {
        const bot = interaction.client as Bot;
        if (bot.settings?.maintenance) {
            throw new BusinessRuleError(
                I18nService.t(interaction.locale, 'common.maintenanceMode'),
                'MAINTENANCE_MODE'
            );
        }

        const [componentId, cacheId] = interaction.customId.split('_');
        const handler = this.registry.get(componentId);

        if (!handler) {
            return;
        }

        const data = cacheId ? InteractionStateService.getInstance().get(cacheId) ?? (bot as any).get?.(cacheId) : null;
        await handler.execute(interaction, data);
    }
}
