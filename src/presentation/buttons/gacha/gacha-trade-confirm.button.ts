import { ButtonInteraction, MessageFlags } from 'discord.js';
import { IButtonHandler } from '../../discord/button.interface';
import { GachaTradeAcceptCardComponent } from '../../ui';
import { InteractionStateService } from '../../../infrastructure/cache/interaction-state.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { BusinessRuleError } from '../../../core/errors';

export class GachaTradeConfirmButton implements IButtonHandler {
    public readonly id = 'gacha-trade-confirm-button';

    public async execute(interaction: ButtonInteraction, data: any): Promise<void> {
        const loc = interaction.locale;
        if (!data) {
            throw new BusinessRuleError(I18nService.t(loc, 'common.expiredInteraction'));
        }

        const cacheId = interaction.customId.split('_')[1];
        if (cacheId) InteractionStateService.getInstance().delete(cacheId);

        const id = InteractionStateService.getInstance().set({
            interactionUser: interaction.user,
            optionsUser: data.optionsUser,
            characterA: data.characterA,
            characterB: data.characterB,
        }, 60_000);

        const comp = new GachaTradeAcceptCardComponent({
            id,
            interactionUserID: interaction.user.id,
            optionsUserID: data.optionsUser.id,
            aCharacterName: data.characterA.name,
            bCharacterName: data.characterB.name,
            aCharacterImageURL: data.characterA.images[0].url,
            bCharacterImageURL: data.characterB.images[0].url,
            locale: loc,
        });

        await interaction.reply({
            flags: [MessageFlags.IsComponentsV2],
            components: [comp],
        });
    }
}

