import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, MessageFlags, ModalSubmitInteraction, TextDisplayBuilder, ThumbnailBuilder } from 'discord.js';
import { IModalHandler } from '../../discord/modal.interface';
import { ErrorEmbed } from '../../ui';
import Helpers from '../../../helpers';
import { InteractionStateService } from '../../../infrastructure/cache/interaction-state.service';
import { I18nService } from '../../../core/i18n/i18n.service';

export class GachaAuctionPushModal implements IModalHandler {
    public readonly id = 'gacha-auction-push-modal';

    public async execute(interaction: ModalSubmitInteraction, data: any): Promise<void> {
        if (!data) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed(I18nService.t(interaction.locale, 'common.expiredInteraction'))],
            });
            return;
        }

        const pushedPrice = interaction.fields.getTextInputValue('gacha-auction-push-modal-input');
        if (!Helpers.isNumber(pushedPrice)) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed('Has ingresado un dato inválido.')],
            });
            return;
        }

        if (Number(pushedPrice) < Number(data.base_price)) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed('¡Tu puja no puede ser menor al precio base!')],
            });
            return;
        }

        const cacheId = interaction.customId.split('_')[1];
        data.users.set(interaction.user.id, Number(pushedPrice));
        InteractionStateService.getInstance().update(cacheId, data, 120_000);

        const avatar = interaction.user.avatarURL({ extension: 'png', size: 512 });
        await interaction.reply({
            flags: [MessageFlags.IsComponentsV2],
            components: [
                new ContainerBuilder()
                    .setAccentColor(Helpers.getRandomRGBTuple())
                    .addSectionComponents(builder => {
                        builder.addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(
                                `### ✋ <@${data.characterUserId}> ¡Hay una nueva puja!\n` +
                                `<@${interaction.user.id}> ha ofertado la suma de:\n` +
                                `### $${pushedPrice}\n¿Deseas aceptar?`
                            )
                        );
                        if (avatar) builder.setThumbnailAccessory(new ThumbnailBuilder().setURL(avatar));
                        return builder;
                    })
                    .addActionRowComponents(
                        new ActionRowBuilder<ButtonBuilder>().addComponents(
                            new ButtonBuilder()
                                .setLabel('¡Aceptar!')
                                .setEmoji('💰')
                                .setStyle(ButtonStyle.Success)
                                .setCustomId(`gacha-auction-accept-push-button_${cacheId}_${interaction.user.id}`)
                        )
                    ),
            ],
        });
    }
}

