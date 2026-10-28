import {
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    ThumbnailBuilder,
    User,
} from 'discord.js';
import Helpers from '../../../../helpers';
import { I18nService } from '../../../../core/i18n/i18n.service';

export interface GachaInventoryCardData {
    id: string;
    user: User;
    pageNumber: number;
    pageTotal: number;
    showIndex: boolean;
    characters: Array<{ name: string; url: string }>;
    locale?: string;
}

export class GachaInventoryCardBuilder extends ContainerBuilder {
    public constructor(data: GachaInventoryCardData) {
        super();
        this.setAccentColor(Helpers.getRandomRGBTuple());

        const avatarURL = data.user.avatarURL({ extension: 'png', size: 1024 }) || '';
        const title = I18nService.t(data.locale, 'ui.charactersOf', { userId: data.user.id });

        this.addTextDisplayComponents(new TextDisplayBuilder().setContent(`### ${title}`));
        this.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));

        const emptyMsg = I18nService.t(data.locale, 'ui.noCharacters');
        const charList = data.characters.map(c => `[${c.name}](${c.url})`).join('\n') || emptyMsg;
        this.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(charList))
                .setThumbnailAccessory(new ThumbnailBuilder().setURL(avatarURL))
        );

        this.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));

        if (data.showIndex) {
            this.addActionRowComponents(row =>
                row.addComponents(
                    new ButtonBuilder()
                        .setEmoji('⬅️')
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(`gacha-inventory-back-button_${data.id}`),
                    new ButtonBuilder()
                        .setEmoji('➡️')
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(`gacha-inventory-next-button_${data.id}`)
                )
            );

            const pageInfo = I18nService.t(data.locale, 'ui.pageInfo', {
                current: data.pageNumber,
                total: data.pageTotal,
            });
            this.addTextDisplayComponents(new TextDisplayBuilder().setContent(pageInfo));
        }
    }
}
