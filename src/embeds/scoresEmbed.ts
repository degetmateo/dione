import { EmbedBuilder } from "discord.js";

const aniuserLink = 'https://anilist.co/user/';
const maluserLink = 'https://myanimelist.net/profile/'

export default class ScoresEmbed extends EmbedBuilder {
    constructor (results: Array<{
        user: {
            type: 'aniuser' | 'maluser';
            id: number | string;
            name: string;
        },
        progress: number;
        repeat: number;
        score: number;
        status: "COMPLETED" | "DROPPED" | "CURRENT" | "PAUSED" | "REPEATING" | "PLANNING";
    }>) {
        super();

        const completed = results.filter(r => r.status === 'COMPLETED').sort((a, b) => b.score - a.score);
        const current = results.filter(r => r.status === 'CURRENT').sort((a, b) => b.score - a.score);
        const dropped = results.filter(r => r.status === 'DROPPED').sort((a, b) => b.score - a.score);
        const paused = results.filter(r => r.status === 'PAUSED').sort((a, b) => b.score - a.score);
        const repeating = results.filter(r => r.status === 'REPEATING').sort((a, b) => b.score - a.score);
        const planning = results.filter(r => r.status === 'PLANNING');

        let description = '';

        const meanServerScore = completed.reduce((acc, r) => acc + r.score, 0) / (completed.length || 1);

        description += `Promedio del Servidor: **[${meanServerScore.toFixed(2)}]**\n\n`;

        if (completed.length > 0) {
            description += `▸ Completed: ${completed.map(r => {
                const name = r.user.name;
                const link = r.user.type === 'aniuser' ? aniuserLink + r.user.name : maluserLink + r.user.name;
                const score = r.score;
                const repeat = r.repeat + 1;

                return `**[${name}](${link}) [${score}] [x${repeat}]**`;
            }).join(' - ')}\n\n`;
        };

        if (current.length > 0) {
            description += `▸ In Progress: ${current.map(r => {
                const name = r.user.name;
                const link = r.user.type === 'aniuser' ? aniuserLink + r.user.name : maluserLink + r.user.name;
                const score = r.score;
                const progress = r.progress;

                return `**[${name}](${link}) (${progress}) [${score}]**`
            }).join(' - ')}\n\n`;
        };

        if (dropped.length > 0) {
            description += `▸ Dropped: ${dropped.map(r => {
                const name = r.user.name;
                const link = r.user.type === 'aniuser' ? aniuserLink + r.user.name : maluserLink + r.user.name;
                const score = r.score;
                const progress = r.progress;
                
                return `**[${name}](${link}) (${progress}) [${score}]**`
            }).join(' - ')}\n\n`;
        };

        if (paused.length > 0) {
            description += `▸ Paused: ${paused.map(r => {
                const name = r.user.name;
                const link = r.user.type === 'aniuser' ? aniuserLink + r.user.name : maluserLink + r.user.name;
                const score = r.score;
                const progress = r.progress;

                return `**[${name}](${link}) (${progress}) [${score}]**`
            }).join(' - ')}\n\n`;
        };

        if (repeating.length > 0) {
            description += `▸ Repeating: ${repeating.map(r => {
                const name = r.user.name;
                const link = r.user.type === 'aniuser' ? aniuserLink + r.user.name : maluserLink + r.user.name;
                const score = r.score;
                const progress = r.progress;

                return `**[${name}](${link}) (${progress}) [${score}]**`
            }).join(' - ')}\n\n`;
        };

        if (planning.length > 0) {
            description += `▸ Planning: ${planning.map(r => {
                const name = r.user.name;
                const link = r.user.type === 'aniuser' ? aniuserLink + r.user.name : maluserLink + r.user.name;
                
                return `**[${name}](${link})**`
            }).join(' - ')}\n\n`;
        };

        if (description.length > 4096) {
            description = description.slice(0, 4000) + '...';
        };

        this.setColor('Green');
        this.setDescription(description);
    };
};