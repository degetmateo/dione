import { EmbedBuilder } from 'discord.js';
import { I18nService } from '../../../../core/i18n/i18n.service';

export interface ScoreEntry {
    user: { type: 'aniuser' | 'maluser'; id: number | string; name: string };
    progress: number;
    repeat: number;
    score: number;
    status: 'COMPLETED' | 'DROPPED' | 'CURRENT' | 'PAUSED' | 'REPEATING' | 'PLANNING';
}

const ANI_USER_URL = 'https://anilist.co/user/';
const MAL_USER_URL = 'https://myanimelist.net/profile/';

export class ScoresEmbed extends EmbedBuilder {
    public constructor(results: ScoreEntry[], locale?: string) {
        super();

        const byStatus = (status: ScoreEntry['status']) =>
            results.filter(r => r.status === status).sort((a, b) => b.score - a.score);

        const completed = byStatus('COMPLETED');
        const current = byStatus('CURRENT');
        const dropped = byStatus('DROPPED');
        const paused = byStatus('PAUSED');
        const repeating = byStatus('REPEATING');
        const planning = results.filter(r => r.status === 'PLANNING');

        const mean = completed.reduce((acc, r) => acc + r.score, 0) / (completed.length || 1);
        const serverAvg = I18nService.t(locale, 'ui.serverAverage');
        let desc = `${serverAvg}: **[${mean.toFixed(2)}]**\n\n`;

        const linkOf = (u: ScoreEntry['user']) =>
            u.type === 'aniuser' ? `${ANI_USER_URL}${u.name}` : `${MAL_USER_URL}${u.name}`;

        if (completed.length) {
            desc += `▸ Completed: ${completed.map(r => `**[${r.user.name}](${linkOf(r.user)}) [${r.score}] [x${r.repeat + 1}]**`).join(' - ')}\n\n`;
        }
        if (current.length) {
            desc += `▸ In Progress: ${current.map(r => `**[${r.user.name}](${linkOf(r.user)}) (${r.progress}) [${r.score}]**`).join(' - ')}\n\n`;
        }
        if (dropped.length) {
            desc += `▸ Dropped: ${dropped.map(r => `**[${r.user.name}](${linkOf(r.user)}) (${r.progress}) [${r.score}]**`).join(' - ')}\n\n`;
        }
        if (paused.length) {
            desc += `▸ Paused: ${paused.map(r => `**[${r.user.name}](${linkOf(r.user)}) (${r.progress}) [${r.score}]**`).join(' - ')}\n\n`;
        }
        if (repeating.length) {
            desc += `▸ Repeating: ${repeating.map(r => `**[${r.user.name}](${linkOf(r.user)}) (${r.progress}) [${r.score}]**`).join(' - ')}\n\n`;
        }
        if (planning.length) {
            desc += `▸ Planning: ${planning.map(r => `**[${r.user.name}](${linkOf(r.user)})**`).join(' - ')}\n\n`;
        }

        if (desc.length > 4096) desc = desc.slice(0, 4000) + '...';
        this.setColor('Green');
        this.setDescription(desc);
    }
}
