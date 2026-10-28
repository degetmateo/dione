import {
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    TextDisplayBuilder,
} from 'discord.js';
import Helpers from '../../../../helpers';
import { I18nService } from '../../../../core/i18n/i18n.service';

export interface GachaTradeConfirmCardData {
    id: string;
    aCharacterName: string;
    bCharacterName: string;
    aCharacterImageURL: string;
    bCharacterImageURL: string;
    locale?: string;
}

export class GachaTradeConfirmCardBuilder extends ContainerBuilder {
    public constructor(data: GachaTradeConfirmCardData) {
        super();
        this.setAccentColor(Helpers.getRandomRGBTuple());

        const desc = I18nService.t(data.locale, 'ui.tradeConfirmDesc', {
            give: data.aCharacterName,
            receive: data.bCharacterName,
        });
        const btnLabel = I18nService.t(data.locale, 'ui.confirmTrade');

        this.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`### ${btnLabel}\n${desc}`)
        );

        this.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                new MediaGalleryItemBuilder().setURL(data.aCharacterImageURL),
                new MediaGalleryItemBuilder().setURL(data.bCharacterImageURL)
            )
        );

        this.addActionRowComponents(row =>
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`gacha-trade-confirm-button_${data.id}`)
                    .setLabel(btnLabel)
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Success)
            )
        );
    }
}
