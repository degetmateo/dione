import {
    ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    TextDisplayBuilder,
} from 'discord.js';
import Helpers from '../../../../helpers';
import { I18nService } from '../../../../core/i18n/i18n.service';

export interface GachaTradeFinishCardData {
    interactionUserID: string;
    optionsUserID: string;
    aCharacterName: string;
    bCharacterName: string;
    aCharacterImageURL: string;
    bCharacterImageURL: string;
    locale?: string;
}

export class GachaTradeFinishCardBuilder extends ContainerBuilder {
    public constructor(data: GachaTradeFinishCardData) {
        super();
        this.setAccentColor(Helpers.getRandomRGBTuple());

        const title = I18nService.t(data.locale, 'ui.tradeCompletedTitle');
        const desc = I18nService.t(data.locale, 'ui.tradeFinishDesc', {
            userA: data.interactionUserID,
            charA: data.bCharacterName,
            userB: data.optionsUserID,
            charB: data.aCharacterName,
        });

        this.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`### 🤝 ${title}\n${desc}`)
        );

        this.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                new MediaGalleryItemBuilder().setURL(data.aCharacterImageURL),
                new MediaGalleryItemBuilder().setURL(data.bCharacterImageURL)
            )
        );
    }
}
