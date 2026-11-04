import { ChannelType, Colors, EmbedBuilder } from 'discord.js';
import Bot from '../../bot/bot';
import { ValidationError } from '../../core/errors';

export type AnnouncementStyle = 'info' | 'warning' | 'maintenance' | 'success';

export interface AnnouncementRequest {
    target: 'channel' | 'broadcast';
    channelId?: string;
    title?: string;
    message: string;
    style?: AnnouncementStyle;
}

export interface GuildSummary {
    id: string;
    name: string;
    memberCount: number;
    channels: Array<{ id: string; name: string }>;
}

export class AnnouncementService {
    private static readonly STYLE_COLORS: Record<AnnouncementStyle, number> = {
        info: Colors.Blurple,
        warning: Colors.Gold,
        maintenance: Colors.DarkOrange,
        success: Colors.Green,
    };

    public listGuilds(bot: Bot): GuildSummary[] {
        const guilds = bot.guilds?.cache ? Array.from(bot.guilds.cache.values()) : [];
        return guilds.map(guild => {
            const rawChannels = guild.channels?.cache ? Array.from(guild.channels.cache.values()) : [];
            const channels = rawChannels
                .filter((ch: any) => this.isWritableTextChannel(ch))
                .map((ch: any) => ({ id: ch.id, name: ch.name || ch.id }));
            return { id: guild.id, name: guild.name, memberCount: guild.memberCount ?? 0, channels };
        });
    }

    public async send(bot: Bot, payload: AnnouncementRequest): Promise<{ sent: number; failed: number }> {
        const text = payload?.message?.trim();
        if (!text) throw new ValidationError('El mensaje del aviso no puede estar vacío.');

        const style: AnnouncementStyle = payload.style && AnnouncementService.STYLE_COLORS[payload.style] ? payload.style : 'info';
        const embed = new EmbedBuilder()
            .setColor(AnnouncementService.STYLE_COLORS[style])
            .setTitle(payload.title?.trim() || '📢 Aviso Oficial de Dione')
            .setDescription(text)
            .setTimestamp();

        if (payload.target === 'channel') {
            if (!payload.channelId) throw new ValidationError('Debes seleccionar un canal destino.');
            const ch: any = bot.channels?.cache?.get(payload.channelId)
                ?? (bot.channels?.fetch ? await bot.channels.fetch(payload.channelId).catch(() => null) : null);
            if (!ch || typeof ch.send !== 'function') throw new ValidationError('El canal seleccionado no existe o no admite mensajes.');
            await ch.send({ embeds: [embed] });
            return { sent: 1, failed: 0 };
        }

        let sent = 0;
        let failed = 0;
        const guilds = bot.guilds?.cache ? Array.from(bot.guilds.cache.values()) : [];
        for (const guild of guilds) {
            const targetChannel: any = this.resolveBroadcastChannel(guild);
            if (!targetChannel) { failed += 1; continue; }
            try { await targetChannel.send({ embeds: [embed] }); sent += 1; } catch { failed += 1; }
        }
        return { sent, failed };
    }

    private resolveBroadcastChannel(guild: any): any {
        if (guild.systemChannel && typeof guild.systemChannel.send === 'function') return guild.systemChannel;
        const list = guild.channels?.cache ? Array.from(guild.channels.cache.values()) : [];
        return list.find((c: any) => this.isWritableTextChannel(c)) ?? null;
    }

    private isWritableTextChannel(ch: any): boolean {
        const isGuildText = ch.type === ChannelType.GuildText || ch.type === ChannelType.GuildAnnouncement || ch.type === 0;
        return Boolean(ch && typeof ch.send === 'function' && isGuildText);
    }
}

