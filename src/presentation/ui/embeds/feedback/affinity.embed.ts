import { EmbedBuilder } from 'discord.js';
import { I18nService } from '../../../../core/i18n/i18n.service';

export interface AffinityEmbedData {
    affinity: number;
    userAId: string;
    userBId: string;
    locale?: string;
}

export class AffinityEmbed extends EmbedBuilder {
    public constructor(data: AffinityEmbedData) {
        super();
        this.setColor('Green');
        const desc = I18nService.t(data.locale, 'affinity.affinityResult', {
            userAId: data.userAId,
            userBId: data.userBId,
            affinity: data.affinity.toFixed(2),
        });
        this.setDescription(desc);
    }
}
