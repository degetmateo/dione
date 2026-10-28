import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, TextDisplayBuilder } from 'discord.js';
import { IButtonHandler } from '../../discord/button.interface';
import { ErrorEmbed } from '../../ui';
import Helpers from '../../../helpers';
import { InteractionStateService } from '../../../infrastructure/cache/interaction-state.service';
import { I18nService } from '../../../core/i18n/i18n.service';

export class GachaSellConfirmButton implements IButtonHandler {
    public readonly id = 'gacha-sell-confirm-button';

    public async execute(interaction: ButtonInteraction, data: any): Promise<void> {
        const loc = interaction.locale;
        if (!data) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed(I18nService.t(loc, 'common.expiredInteraction'))],
            });
            return;
        }

        if (interaction.user.id !== data.interactionUser.id) return;
        const cacheId = interaction.customId.split('_')[1];
        if (cacheId) InteractionStateService.getInstance().delete(cacheId);

        const memId = InteractionStateService.getInstance().set({
            character: data.character,
            price: data.price,
            optionsUser: data.optionsUser,
            interactionUser: data.interactionUser,
            claim: data.claim,
        }, 60_000);

        const component = new ContainerBuilder().setAccentColor(Helpers.getRandomRGBTuple());
        component.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`### <@${data.optionsUser.id}> ¡Te han ofrecido un personaje!`),
            new TextDisplayBuilder().setContent(`<@${data.interactionUser.id}> te ha ofrecido a \`${data.character.name}\` a cambio de \`${data.price} renas\`.`)
        );

        if (data.character.images?.[0]?.url) {
            component.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(data.character.images[0].url))
            );
        }

        component.addTextDisplayComponents(new TextDisplayBuilder().setContent('### ¿Quieres aceptarlo?'));
        component.addActionRowComponents(
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setLabel('Aceptar')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Success)
                    .setCustomId(`gacha-sell-buy-button_${memId}`)
            )
        );

        await interaction.reply({
            flags: [MessageFlags.IsComponentsV2],
            components: [component],
        });
    }
}

