import { EmbedBuilder } from 'discord.js';
import { DEVSTATUS, T_VN } from '../../../../domain/models';
import Helpers from '../../../../helpers';

export class VnEmbed extends EmbedBuilder {
    public constructor(vn: T_VN) {
        super();

        const thumbnail = vn.image.sexual === 0 && vn.image.violence === 0 ? vn.image.url : null;
        this.setTitle(vn.title);
        this.setURL(`https://vndb.org/${vn.id}`);
        this.setColor('Random');
        this.setDescription(vn.description ? Helpers.clearHTML(vn.description) : null);
        this.setThumbnail(thumbnail);

        const safeScreenshots = vn.screenshots.filter(s => s.sexual === 0 && s.violence === 0);
        const randomScreenshot = Helpers.getRandomElement(safeScreenshots);
        if (randomScreenshot) {
            this.setImage(randomScreenshot.url);
        }

        if (vn.aliases.length > 0) {
            this.setFooter({ text: vn.aliases.join(' | ') });
        }

        let tags = vn.tags.slice(0, 9).map(p => `\`${p.name}\``).join(' - ');
        if (vn.tags.length > 10) tags += ` - \`and ${vn.tags.length - 10} more...\``;

        this.setFields(
            {
                name: '▾',
                value: `Released: **${vn.released}**\nPopularity: **${vn.votecount}**\nScore: **${vn.rating}**\nStatus: **${DEVSTATUS[vn.devstatus]}**`,
                inline: true,
            },
            {
                name: '▾',
                value: `Duration: **${(vn.length_minutes / 60).toFixed(2)}hrs**\nOriginal Language: **${vn.olang}**\nPlayed: **${vn.length_votes} times**\nID: **${vn.id}**`,
                inline: true,
            },
            { name: '▾ Languages', value: vn.languages.map(l => `\`${l}\``).join(' - ') || 'N/A', inline: false },
            { name: '▾ Platforms', value: vn.platforms.map(p => `\`${p}\``).join(' - ') || 'N/A', inline: false },
            { name: '▾ Tags', value: tags || 'N/A', inline: false }
        );
    }
}

