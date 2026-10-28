import { EmbedBuilder } from 'discord.js';
import { I18nService } from '../../../../core/i18n/i18n.service';

export interface VnScoreEntry {
    id: string;
    username: string;
    vote: number;
    status: string;
}

export class VnScoresEmbed extends EmbedBuilder {
    public constructor(scores: VnScoreEntry[], locale?: string) {
        super();

        const byStatus = (status: string) => scores.filter(s => s.status === status);
        const completed = byStatus('FINISHED');
        const reading = byStatus('PLAYING');
        const paused = byStatus('PAUSED');
        const dropped = byStatus('DROPPED');
        const unknown = byStatus('UNKNOWN');

        let desc = '';
        if (completed.length) {
            desc += `Completed: ${completed.map(s => `[${s.username}](https://vndb.org/${s.id}) **[${s.vote}]**`).join(' - ')}\n\n`;
        }
        if (reading.length) {
            desc += `Reading: ${reading.map(s => `[${s.username}](https://vndb.org/${s.id}) **[${s.vote}]**`).join(' - ')}\n\n`;
        }
        if (paused.length) {
            desc += `Paused: ${paused.map(s => `[${s.username}](https://vndb.org/${s.id}) **[${s.vote}]**`).join(' - ')}\n\n`;
        }
        if (dropped.length) {
            desc += `Dropped: ${dropped.map(s => `[${s.username}](https://vndb.org/${s.id}) **[${s.vote}]**`).join(' - ')}\n\n`;
        }
        if (unknown.length) {
            desc += `Unknown: ${unknown.map(s => `[${s.username}](https://vndb.org/${s.id}) **[${s.vote}]**`).join(' - ')}\n\n`;
        }

        const emptyMsg = I18nService.t(locale, 'ui.noScores');
        this.setDescription(desc || emptyMsg);
        this.setColor('Random');
    }
}
