import {
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    User,
} from 'discord.js';
import Helpers from '../../../../helpers';
import { I18nService } from '../../../../core/i18n/i18n.service';

export interface CharacterClaimCardData {
    id: number;
    name: string;
    url: string;
    image: { url: string };
    media: { id: number; title: { userPreferred: string }; siteUrl: string } | null;
    fav_count: number;
    claimed_count: number;
    interaction_id: string;
    owner?: User | null;
    users_who_want?: any[];
    locale?: string;
}

export class CharacterClaimCardBuilder extends ContainerBuilder {
    public constructor(data: CharacterClaimCardData) {
        super();
        this.setAccentColor(Helpers.getRandomRGBTuple());

        this.addTextDisplayComponents(new TextDisplayBuilder().setContent(`### [**${data.name}**](${data.url})`));
        if (data.media) {
            this.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`[${data.media.title.userPreferred}](${data.media.siteUrl})`)
            );
        }

        this.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );

        this.addTextDisplayComponents(new TextDisplayBuilder().setContent(this.buildInfoText(data)));

        const gallery = new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(data.image.url)
        );
        this.addMediaGalleryComponents(gallery);

        this.addActionRowComponents(row => row.addComponents(this.buildButtons(data)));
    }

    private buildInfoText(data: CharacterClaimCardData): string {
        const loc = data.locale;
        let text = data.owner
            ? I18nService.t(loc, 'ui.belongsTo', { owner: data.owner.displayName }) + '\n'
            : '';
        text += `${I18nService.t(loc, 'ui.favorites')}: \`${data.fav_count}\`\n`;
        text += `${I18nService.t(loc, 'ui.claims')}: \`${data.claimed_count}\`\n`;
        if (data.users_who_want?.length) {
            text += `${I18nService.t(loc, 'ui.wishedBy')}: ${data.users_who_want.map(f => `<@${f.user_id}>`).join(' ')}`;
        }
        return text;
    }

    private buildButtons(data: CharacterClaimCardData): ButtonBuilder[] {
        const loc = data.locale;
        const buttons: ButtonBuilder[] = [];
        if (data.owner) {
            buttons.push(
                new ButtonBuilder()
                    .setEmoji('💰')
                    .setLabel(I18nService.t(loc, 'ui.rewardButton'))
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId(`renas-button_${data.interaction_id}`)
            );
        } else {
            buttons.push(
                new ButtonBuilder()
                    .setEmoji('✋')
                    .setLabel(I18nService.t(loc, 'ui.claimButton'))
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`claim-button_${data.interaction_id}`)
            );
        }
        buttons.push(
            new ButtonBuilder()
                .setEmoji('💘')
                .setLabel(I18nService.t(loc, 'ui.wishlistButton'))
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`fav-button_${data.interaction_id}_${data.id}`)
        );
        return buttons;
    }
}
