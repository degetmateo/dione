import { EmbedBuilder } from 'discord.js';

export class UserVndbEmbed extends EmbedBuilder {
    public constructor(vndbuser: any) {
        super();
        this.setTitle(vndbuser.name);
        this.setURL(`https://vndb.org/${vndbuser.id}`);
        this.setColor(vndbuser.color || 'Random');
        this.setThumbnail(vndbuser.avatar);
        this.setImage(vndbuser.banner);

        const parsed = (vndbuser.results || []).map((d: any) => ({
            id: d.id,
            title: d.vn?.title ?? 'VN',
            vote: d.vote || 0,
            tags: d.vn?.tags ?? [],
        })).sort((a: any, b: any) => b.vote - a.vote);

        const tagMap = new Map<string, { name: string; count: number }>();
        for (const vn of parsed) {
            for (const tag of vn.tags) {
                const current = tagMap.get(tag.id) ?? { name: tag.name, count: 0 };
                current.count++;
                tagMap.set(tag.id, current);
            }
        }

        const topTags = Array.from(tagMap.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 12)
            .map(t => `\`${t.name} [${t.count}]\``)
            .join(' ');

        const topVns = parsed
            .slice(0, 10)
            .map((vn: any) => `[\`${vn.title} [${vn.vote}]\`](https://vndb.org/${vn.id})`)
            .join(' ');

        const avgScore = parsed.length
            ? (parsed.reduce((sum: number, p: any) => sum + (p.vote || 0), 0) / parsed.length).toFixed(2)
            : '0.00';

        const totalVns = vndbuser.more ? `más de ${parsed.length}` : `${parsed.length}`;

        let desc =
            `**Información de VNDB**\n` +
            `▸ Cantidad de novelas: \`${totalVns}\`\n` +
            `▸ Promedio de calificación: \`${avgScore} (aproximado)\`\n`;

        if (topVns) desc += `▸ Top novelas:\n${topVns}\n`;
        if (topTags) desc += `▸ Etiquetas más consumidas:\n${topTags}`;

        this.setDescription(desc);
    }
}

