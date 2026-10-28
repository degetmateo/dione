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

export interface CharacterInfoCardData {
    id: number;
    name: string;
    url: string;
    image: { url: string };
    media: { id: number; title: string; siteUrl: string };
    fav_count: number;
    claimed_count: number | null;
    gender: string | null;
    age: string | null;
    bloodType: string | null;
    interaction_id: string;
    owner?: User;
    users_who_want?: string[];
    page_buttons?: boolean;
    locale?: string;
}

export class CharacterInfoCardBuilder extends ContainerBuilder {
    public readonly character_data: CharacterInfoCardData;

    public constructor(data: CharacterInfoCardData) {
        super();
        this.character_data = data;
        this.setAccentColor(Helpers.getRandomRGBTuple());

        this.addTextDisplayComponents(new TextDisplayBuilder().setContent(`### [**${data.name}**](${data.url})`));
        this.addTextDisplayComponents(new TextDisplayBuilder().setContent(`[${data.media.title}](${data.media.siteUrl})`));
        this.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
        this.addTextDisplayComponents(new TextDisplayBuilder().setContent(this.buildDescription(data)));

        const gallery = new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(data.image.url));
        this.addMediaGalleryComponents(gallery);

        this.addActionRowComponents(row => row.addComponents(this.buildActionButtons(data)));
    }

    private buildDescription(data: CharacterInfoCardData): string {
        const loc = data.locale;
        let text = data.owner
            ? I18nService.t(loc, 'ui.belongsTo', { owner: data.owner.displayName }) + '\n'
            : '';
        text += `ID: \`${data.id}\`\n${I18nService.t(loc, 'ui.favorites')}: \`${data.fav_count}\`\n`;
        if (data.claimed_count) text += `${I18nService.t(loc, 'ui.claims')}: \`${data.claimed_count}\`\n`;
        if (data.gender) text += `${I18nService.t(loc, 'ui.gender')}: \`${data.gender}\`\n`;
        if (data.age) text += `${I18nService.t(loc, 'ui.age')}: \`${data.age}\`\n`;
        if (data.bloodType) text += `${I18nService.t(loc, 'ui.bloodType')}: \`${data.bloodType}\`\n`;
        if (data.users_who_want?.length) {
            text += `${I18nService.t(loc, 'ui.wishedBy')}: ${data.users_who_want.map(id => `<@${id}>`).join(' ')}`;
        }
        return text;
    }

    private buildActionButtons(data: CharacterInfoCardData): ButtonBuilder[] {
        const buttons: ButtonBuilder[] = [];
        if (data.page_buttons) {
            buttons.push(
                new ButtonBuilder()
                    .setEmoji('⬅️')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId(`character-back-button_${data.interaction_id}`),
                new ButtonBuilder()
                    .setEmoji('➡️')
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId(`character-next-button_${data.interaction_id}`)
            );
        }
        buttons.push(
            new ButtonBuilder()
                .setEmoji('💘')
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`character-fav-button_${data.interaction_id}`)
        );
        return buttons;
    }
}
