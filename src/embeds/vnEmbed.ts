import { EmbedBuilder } from "discord.js";
import { DEVSTATUS, VN } from "../apis/vndb/vndbTypes";
import VNDB from "../apis/vndb/vndb";
import Helpers from "../helpers";

export default class VNEmbed extends EmbedBuilder {
    constructor (vn: VN) {
        super();
        
        this.setTitle(vn.title);
        this.setURL(VNDB.URL + '/' + vn.id);
        this.setColor("Random");
        this.setDescription(vn.description ? Helpers.clearHTML(vn.description) : null);
        this.setThumbnail(vn.image.url);
        this.setImage(Helpers.getRandomElement(vn.screenshots)?.url || null);

        if (vn.aliases.length > 0) {
            this.setFooter({
                text: vn.aliases.join(' | ')
            });
        };

        let tags = vn.tags.slice(0, 9).map(p => `\`${p.name}\``).join(' - ');
        if (vn.tags.length > 10) tags += ` - \`and ${vn.tags.length - 10} more...\``;

        this.setFields(
            {
                name: "▾",
                value: `Released: **${vn.released}**\nPopularity: **${vn.votecount}**\nScore: **${vn.rating}**\nStatus: **${DEVSTATUS[vn.devstatus]}**`,
                inline: true
            },
            {
                name: "▾",
                value: `Duration: **${(vn.length_minutes / 60).toFixed(2)}hrs**\nOriginal Language: **${vn.olang}**\nPlayed: **${vn.length_votes} times**\nID: **${vn.id}**`,
                inline: true
            },
            {
                name: "▾ Languages",
                value: vn.languages.map(l => `\`${l}\``).join(' - '),
                inline: false
            },
            {
                name: "▾ Platforms",
                value: vn.platforms.map(p => `\`${p}\``).join(' - '),
                inline: false
            },
            {
                name: "▾ Tags",
                value: tags,
                inline: false
            }
        );
    };
};