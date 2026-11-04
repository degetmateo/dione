import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { ChannelType } from 'discord.js';
import { AdminWebServer } from '../../src/infrastructure/web/admin-web.server';
import { BotSettingsService } from '../../src/core/config/bot-settings.service';
import { OsCredentialVerifier } from '../../src/infrastructure/web/os-credential.verifier';

describe('AdminWebServer Local & LAN Control Panel with Authentication', () => {
    let server: AdminWebServer;
    let baseUrl: string;
    let tempSettingsPath: string;
    let settingsService: BotSettingsService;
    let mockSendChannel: ReturnType<typeof vi.fn>;
    let mockBot: any;
    let mockOsVerifier: OsCredentialVerifier;

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

        mockOsVerifier = {
            getDefaultUsername: () => 'hostuser',
            verify: vi.fn().mockImplementation(async (u, p) => u === 'hostuser' && p === 'correct_host_pass'),
        } as unknown as OsCredentialVerifier;

        server = new AdminWebServer(mockBot, {
            port: 0,
            host: '127.0.0.1',
            secret: 'test-secret',
            settingsService,
            osVerifier: mockOsVerifier,
        });
        const port = await server.start();
        baseUrl = `http://127.0.0.1:${port}`;
    });

    afterEach(async () => {
        await server.stop();
        await fs.unlink(tempSettingsPath).catch(() => {});
    });

    it('should display login view when unauthenticated and allow login with host OS password', async () => {
        const pageRes = await fetch(`${baseUrl}/`);
        expect(pageRes.status).toBe(200);
        const pageHtml = await pageRes.text();
        expect(pageHtml).toContain('Dione — Autenticación de Red Local');
        expect(pageHtml).toContain('hostuser');

        const failRes = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'hostuser', password: 'wrong_password' }),
        });
        expect(failRes.status).toBe(401);

        const okRes = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'hostuser', password: 'correct_host_pass' }),
        });
        expect(okRes.status).toBe(200);
        const setCookie = okRes.headers.get('set-cookie');
        expect(setCookie).toContain('dione_session=');

        const authPageRes = await fetch(`${baseUrl}/`, {
            headers: { Cookie: setCookie || '' },
        });
        expect(authPageRes.status).toBe(200);
        const authHtml = await authPageRes.text();
        expect(authHtml).toContain('Dione — Panel de Administración Local');
    });

    it('should allow API requests using session cookie or header secret', async () => {
        const unauth = await fetch(`${baseUrl}/api/status`);
        expect(unauth.status).toBe(401);

        const bySecret = await fetch(`${baseUrl}/api/status`, {
            headers: { 'x-admin-secret': 'test-secret' },
        });
        expect(bySecret.status).toBe(200);
        const status = await bySecret.json();
        expect(status.botTag).toBe('Dione#0001');

        const okRes = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'hostuser', password: 'correct_host_pass' }),
        });
        const cookie = okRes.headers.get('set-cookie') || '';

        const patchRes = await fetch(`${baseUrl}/api/settings`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Cookie: cookie },
            body: JSON.stringify({ media_api_provider: 'mal', maintenance: true }),
        });
        expect(patchRes.status).toBe(200);
        expect(mockBot.settings.media_api_provider).toBe('mal');
        expect(mockBot.settings.maintenance).toBe(true);
    });
});
