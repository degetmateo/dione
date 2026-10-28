import { ColorResolvable, EmbedBuilder, User } from 'discord.js';

export interface UserProfileEmbedData {
    member: any;
    user: User;
}

export class UserProfileEmbed extends EmbedBuilder {
    public constructor(data: UserProfileEmbedData) {
        super();
        this.setTitle(data.user.globalName || data.user.username);

        const avatar = data.member.profile?.avatar_url || data.user.avatarURL();
        const banner = data.member.profile?.banner_url || data.user.bannerURL({ size: 1024 });
        const color = (data.member.profile?.color || data.user.hexAccentColor || 'Random') as ColorResolvable;

        this.setThumbnail(avatar);
        this.setImage(banner);
        this.setColor(color);

        const createdDate = data.member.created_at
            ? new Date(data.member.created_at).toDateString()
            : 'Desconocida';

        const description =
            `▸ Se unió el \`${createdDate}\`\n` +
            `▸ Renas \`$${data.member.renas ?? 0}\`\n` +
            `▸ Personajes reclamados: \`${data.member.claimed_characters_count ?? 0}\`\n` +
            `▸ Pulls restantes: \`${data.member.gacha?.pulls ?? 0}\`\n` +
            `▸ Claims restantes: \`${data.member.gacha?.claims ?? 0}\`\n\n`;

        this.setDescription(description);
    }
}

