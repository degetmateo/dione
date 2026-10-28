import { ButtonInteraction, ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, TextDisplayBuilder } from 'discord.js';
import { IButtonHandler } from '../../discord/button.interface';
import { ErrorEmbed } from '../../ui';
import mongo from '../../../database/mongo';
import Helpers from '../../../helpers';
import { InteractionStateService } from '../../../infrastructure/cache/interaction-state.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { BusinessRuleError } from '../../../core/errors';

export class GachaSellBuyButton implements IButtonHandler {
    public readonly id = 'gacha-sell-buy-button';

    public async execute(interaction: ButtonInteraction, data: any): Promise<void> {
        const loc = interaction.locale;
        if (!data) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed(I18nService.t(loc, 'common.expiredInteraction'))],
            });
            return;
        }

        if (interaction.user.id !== data.optionsUser.id) return;
        const cacheId = interaction.customId.split('_')[1];
        if (cacheId) InteractionStateService.getInstance().delete(cacheId);

        await interaction.deferReply();
        const user = await mongo.users.findOne({ _id: data.optionsUser.id as any });
        if (!user) throw new BusinessRuleError(I18nService.t(loc, 'common.notRegistered'));

        if (user.renas < data.price) {
            const msg = I18nService.t(loc, 'gacha.insufficientRenas', { price: data.price });
            await interaction.editReply({
                flags: [MessageFlags.IsComponentsV2],
                components: [new TextDisplayBuilder().setContent(msg)],
            });
            return;
        }

        await mongo.users.updateOne({ _id: data.optionsUser.id as any }, { $inc: { renas: -data.price } });
        await mongo.users.updateOne({ _id: data.interactionUser.id as any }, { $inc: { renas: data.price } });
        await mongo.claims.updateOne({ _id: data.claim._id }, { $set: { user_id: data.optionsUser.id } });

        const component = new ContainerBuilder().setAccentColor(Helpers.getRandomRGBTuple());
        component.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`✅ <@${data.optionsUser.id}> ha comprado a \`${data.character.name}\` por \`${data.price} renas\`.`)
        );

        if (data.character.images?.[0]?.url) {
            component.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(data.character.images[0].url))
            );
        }

        await interaction.editReply({
            flags: [MessageFlags.IsComponentsV2],
            components: [component],
        });
    }
}

