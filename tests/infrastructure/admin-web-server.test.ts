import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { ChannelType } from 'discord.js';
import { AdminWebServer } from '../../src/infrastructure/web/admin-web.server';
import { BotSettingsService } from '../../src/core/config/bot-settings.service';

describe('AdminWebServer Local Control Panel & REST Endpoints', () => {
    let server: AdminWebServer;
    let baseUrl: string;
    let tempSettingsPath: string;
    let settingsService: BotSettingsService;
    let mockSendChannel: ReturnType<typeof vi.fn>;
    let mockBot: any;

    beforeEach(async () => {
        tempSettingsPath = path.join(os.tmpdir(), `dione-admin-test-${Date.now()}.json`);
        settingsService = new BotSettingsService(tempSettingsPath);
        await settingsService.load();

        mockSendChannel = vi.fn().mockResolvedValue(undefined);
        const textChannel = { id: 'ch-100', name: 'general', type: ChannelType.GuildText, send: mockSendChannel };
        const guild = {
            id: 'guild-1', name: 'Servidor Otaku', memberCount: 42,
            systemChannel: textChannel, channels: { cache: new Map([['ch-100', textChannel]]) },
        };

        mockBot = {
            user: { tag: 'Dione#0001' }, isReady: () => true, uptime: 120_000,
            settings: settingsService.get(),
            guilds: { cache: new Map([['guild-1', guild]]) },
            channels: { cache: new Map([['ch-100', textChannel]]) },
        };

        server = new AdminWebServer(mockBot, { port: 0, host: '127.0.0.1', secret: 'test-secret', settingsService });
        const port = await server.start();
        baseUrl = `http://127.0.0.1:${port}`;
    });

    afterEach(async () => {
        await server.stop();
        await fs.unlink(tempSettingsPath).catch(() => {});
    });

    it('should serve HTML dashboard on GET / and protect /api/* with ADMIN_SECRET', async () => {
        const htmlRes = await fetch(`${baseUrl}/`);
        expect(htmlRes.status).toBe(200);
        expect(await htmlRes.text()).toContain('Dione — Panel de Administración Local');

        const unauthRes = await fetch(`${baseUrl}/api/status`);
        expect(unauthRes.status).toBe(401);

        const authRes = await fetch(`${baseUrl}/api/status`, { headers: { 'x-admin-secret': 'test-secret' } });
        const status = await authRes.json();
        expect(authRes.status).toBe(200);
        expect(status.botTag).toBe('Dione#0001');
        expect(status.guildsCount).toBe(1);
    });

    it('should update API provider and maintenance settings dynamically via PATCH /api/settings', async () => {
        const res = await fetch(`${baseUrl}/api/settings`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'x-admin-secret': 'test-secret' },
            body: JSON.stringify({
                media_api_provider: 'mal', maintenance: true,
                maintenance_reason: 'Mantenimiento preventivo', renas_per_reclaim: 15,
            }),
        });
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body.settings.media_api_provider).toBe('mal');
        expect(mockBot.settings.maintenance).toBe(true);
        expect(mockBot.settings.maintenance_reason).toBe('Mantenimiento preventivo');
        expect(mockBot.settings.renas_per_reclaim).toBe(15);
    });

    it('should list guilds and dispatch announcements to broadcasts', async () => {
        const guildsRes = await fetch(`${baseUrl}/api/guilds`, { headers: { 'x-admin-secret': 'test-secret' } });
        const guildsBody = await guildsRes.json();
        expect(guildsBody.guilds[0].name).toBe('Servidor Otaku');

        const noticeRes = await fetch(`${baseUrl}/api/announcements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-secret': 'test-secret' },
            body: JSON.stringify({
                target: 'broadcast', title: 'Aviso Importante',
                message: 'Conmutando temporalmente a Jikan API.', style: 'maintenance',
            }),
        });
        const noticeBody = await noticeRes.json();
        expect(noticeRes.status).toBe(200);
        expect(noticeBody.sent).toBe(1);
        expect(mockSendChannel).toHaveBeenCalledTimes(1);
    });
});
