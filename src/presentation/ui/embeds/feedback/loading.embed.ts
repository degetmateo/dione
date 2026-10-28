import { EmbedBuilder } from 'discord.js';
import { I18nService } from '../../../../core/i18n/i18n.service';

export class LoadingEmbed extends EmbedBuilder {
    public constructor(message?: string, locale?: string) {
        super();
        const msg = message ?? I18nService.t(locale, 'ui.loading');
        this.setDescription(msg);
        this.setImage(
            'https://media.discordapp.net/attachments/1398528876195348591/1398528920126619708/bar.gif'
        );
        this.setColor('Green');
    }
}
