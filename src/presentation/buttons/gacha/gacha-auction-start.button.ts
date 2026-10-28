import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, TextDisplayBuilder } from 'discord.js';
import { IButtonHandler } from '../../discord/button.interface';
import { ErrorEmbed } from '../../ui';
import Helpers from '../../../helpers';
import { InteractionStateService } from '../../../infrastructure/cache/interaction-state.service';
import { I18nService } from '../../../core/i18n/i18n.service';

export class GachaAuctionStartButton implements IButtonHandler {
    public readonly id = 'gacha-auction-start-button';

    public async execute(interaction: ButtonInteraction, data: any): Promise<void> {
        if (!data) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed(I18nService.t(interaction.locale, 'common.expiredInteraction'))],
            });
            return;
        }

        const cacheId = interaction.customId.split('_')[1];
        if (cacheId) InteractionStateService.getInstance().delete(cacheId);

        const key = InteractionStateService.getInstance().set({
            character: data.character,
            base_price: data.base_price,
            characterUserId: interaction.user.id,
            users: new Map<string, number>(),
        }, 120_000);

        await interaction.reply({
            flags: [MessageFlags.IsComponentsV2],
            components: [
                new ContainerBuilder()
                    .setAccentColor(Helpers.getRandomRGBTuple())
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`### ¡Subasta por ${data.character.name}!`),
                        new TextDisplayBuilder().setContent(`<@${interaction.user.id}> ha iniciado una subasta por este personaje.`),
                        new TextDisplayBuilder().setContent('Presiona el botón para pujar ¡y tal vez ganes!')
                    )
                    .addMediaGalleryComponents(
                        new MediaGalleryBuilder().addItems(
                            new MediaGalleryItemBuilder().setURL(data.character.images[0].url)
                        )
                    )
                    .addActionRowComponents(
                        new ActionRowBuilder<ButtonBuilder>().addComponents(
                            new ButtonBuilder()
                                .setEmoji('💰')
                                .setLabel('¡Pujar!')
                                .setStyle(ButtonStyle.Primary)
                                .setCustomId(`gacha-auction-push-button_${key}`)
                        )
                    ),
            ],
        });
    }
}

