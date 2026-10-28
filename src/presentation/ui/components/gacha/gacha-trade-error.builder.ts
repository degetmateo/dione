import { ContainerBuilder, SectionBuilder, TextDisplayBuilder, ThumbnailBuilder } from 'discord.js';
import { RGB_COLORS } from '../../../../static/rgb-colors';
import { I18nService } from '../../../../core/i18n/i18n.service';

export class GachaTradeErrorBuilder extends ContainerBuilder {
    public constructor(characterName: string, characterImage: string, locale?: string) {
        super();
        this.setAccentColor(RGB_COLORS.RED);
        const msg = I18nService.t(locale, 'ui.tradeNotClaimedError', { name: characterName });
        this.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(msg))
                .setThumbnailAccessory(new ThumbnailBuilder().setURL(characterImage))
        );
    }
}
