import { Colors, EmbedBuilder } from 'discord.js';
import { I18nService } from '../../../../core/i18n/i18n.service';

export class SetupSuccessEmbed extends EmbedBuilder {
    public constructor(name: string, url: string, locale?: string) {
        super();
        this.setColor(Colors.Green);
        this.setDescription(I18nService.t(locale, 'setup.successDesc', { name, url }));
    }
}
