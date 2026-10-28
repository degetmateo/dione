import { EmbedBuilder } from 'discord.js';
import { I18nService } from '../../../../core/i18n/i18n.service';

export class SetupInstructionsEmbed extends EmbedBuilder {
    public constructor(service: string = 'ANILIST', locale?: string) {
        super();
        this.setTitle(I18nService.t(locale, 'setup.instructionsTitle', { service }));
        this.setColor(0xff8c00);
        this.setFooter({ text: I18nService.t(locale, 'setup.instructionsFooter') });
        this.setDescription(I18nService.t(locale, 'setup.instructionsBody'));
    }
}
