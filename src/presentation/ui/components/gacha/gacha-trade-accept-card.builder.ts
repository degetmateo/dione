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

export interface GachaTradeAcceptCardData {
    id: string;
    interactionUserID: string;
    optionsUserID: string;
    aCharacterName: string;
    bCharacterName: string;
    aCharacterImageURL: string;
    bCharacterImageURL: string;
    locale?: string;
}

export class GachaTradeAcceptCardBuilder extends ContainerBuilder {
    public constructor(data: GachaTradeAcceptCardData) {
        super();
        this.setAccentColor(Helpers.getRandomRGBTuple());

        const title = I18nService.t(data.locale, 'ui.tradeAcceptTitle', { userId: data.optionsUserID });
        const desc = I18nService.t(data.locale, 'ui.tradeAcceptDesc', {
            authorId: data.interactionUserID,
            give: data.aCharacterName,
            receive: data.bCharacterName,
        });
        const btnLabel = I18nService.t(data.locale, 'ui.acceptTrade');

        this.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`### ${title}\n${desc}`)
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
                    .setCustomId(`gacha-trade-accept-button_${data.id}`)
                    .setLabel(btnLabel)
                    .setEmoji('🤝')
                    .setStyle(ButtonStyle.Success)
            )
        );
    }
}
