import { ButtonInteraction, MessageFlags } from 'discord.js';
import { IButtonHandler } from '../../discord/button.interface';
import mongo from '../../../database/mongo';
import { GachaTradeFinishCardComponent } from '../../ui';
import { InteractionStateService } from '../../../infrastructure/cache/interaction-state.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { BusinessRuleError } from '../../../core/errors';

export class GachaTradeAcceptButton implements IButtonHandler {
    public readonly id = 'gacha-trade-accept-button';

    public async execute(interaction: ButtonInteraction, data: any): Promise<void> {
        const loc = interaction.locale;
        if (!data) throw new BusinessRuleError(I18nService.t(loc, 'common.expiredInteraction'));
        if (interaction.user.id !== data.optionsUser.id) {
            throw new BusinessRuleError(I18nService.t(loc, 'common.unauthorized'));
        }

        const cacheId = interaction.customId.split('_')[1];
        if (cacheId) InteractionStateService.getInstance().delete(cacheId);

        const claimA = await mongo.claims.findOne({
            guild_id: interaction.guild?.id,
            user_id: data.interactionUser.id,
            character_id: data.characterA._id,
        });

        const claimB = await mongo.claims.findOne({
            guild_id: interaction.guild?.id,
            user_id: data.optionsUser.id,
            character_id: data.characterB._id,
        });

        if (!claimA || !claimB) throw new BusinessRuleError(I18nService.t(loc, 'common.unexpectedError'));

        await mongo.claims.updateOne({ _id: claimA._id }, { $set: { user_id: data.optionsUser.id } });
        await mongo.claims.updateOne({ _id: claimB._id }, { $set: { user_id: data.interactionUser.id } });

        const comp = new GachaTradeFinishCardComponent({
            interactionUserID: data.interactionUser.id,
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

