import { IncomingMessage, ServerResponse } from 'node:http';
import Bot from '../../bot/bot';
import { BotSettingsService } from '../../core/config/bot-settings.service';
import { ApiClientFactory } from '../external-apis/api-client.factory';
import { AnnouncementService } from './announcement.service';

export class AdminApiController {
    public constructor(
        private readonly bot: Bot,
        private readonly settingsService: BotSettingsService = BotSettingsService.getInstance(),
        private readonly announcementService: AnnouncementService = new AnnouncementService()
    ) {}

    public async handle(
        req: IncomingMessage,
        res: ServerResponse,
        pathname: string,
        body: any
    ): Promise<boolean> {
        const method = req.method || 'GET';

        if (method === 'GET' && pathname === '/api/status') {
            this.sendJson(res, 200, {
                ok: true,
                botTag: this.bot.user?.tag ?? 'Conectando...',
                ready: typeof this.bot.isReady === 'function' ? this.bot.isReady() : false,
                guildsCount: this.bot.guilds?.cache?.size ?? 0,
                uptimeSeconds: Math.floor((this.bot.uptime ?? 0) / 1000),
                settings: this.settingsService.get(),
                failover: ApiClientFactory.getResilientMediaService().getStats(),
            });
            return true;
        }

        if (method === 'GET' && pathname === '/api/settings') {
            this.sendJson(res, 200, { ok: true, settings: this.settingsService.get() });
            return true;
        }

        if ((method === 'PATCH' || method === 'POST') && pathname === '/api/settings') {
            const updated = await this.settingsService.save(body || {});
            this.bot.settings = updated;
            this.sendJson(res, 200, { ok: true, settings: updated });
            return true;
        }

        if (method === 'GET' && pathname === '/api/guilds') {
            this.sendJson(res, 200, { ok: true, guilds: this.announcementService.listGuilds(this.bot) });
            return true;
        }

        if (method === 'POST' && pathname === '/api/announcements') {
            const result = await this.announcementService.send(this.bot, body || {});
            this.sendJson(res, 200, { ok: true, ...result });
            return true;
        }

        return false;
    }

    public sendJson(res: ServerResponse, status: number, payload: unknown): void {
        const json = JSON.stringify(payload);
        res.writeHead(status, {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
        });
        res.end(json);
    }
}

