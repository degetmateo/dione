import http, { IncomingMessage, Server, ServerResponse } from 'node:http';
import { AddressInfo } from 'node:net';
import Bot from '../../bot/bot';
import { BotSettingsService } from '../../core/config/bot-settings.service';
import { AdminApiController } from './admin-api.controller';
import { DashboardHtmlView } from './dashboard-html.view';

export interface AdminServerOptions {
    port?: number;
    host?: string;
    secret?: string;
    settingsService?: BotSettingsService;
}

export class AdminWebServer {
    private server: Server | null = null;
    private readonly port: number;
    private readonly host: string;
    private readonly secret: string;
    private readonly apiController: AdminApiController;

    public constructor(bot: Bot, options: AdminServerOptions = {}) {
        this.port = options.port ?? (Number(process.env.PORT) || 3000);
        this.host = options.host ?? process.env.ADMIN_HOST ?? '127.0.0.1';
        this.secret = options.secret ?? process.env.ADMIN_SECRET ?? '';
        this.apiController = new AdminApiController(bot, options.settingsService);
    }

    public start(): Promise<number> {
        return new Promise((resolve, reject) => {
            this.server = http.createServer((req, res) => {
                this.route(req, res).catch(err => {
                    this.apiController.sendJson(res, 400, { ok: false, error: err?.message || 'Error interno' });
                });
            });

            this.server.once('error', err => reject(err));
            this.server.listen(this.port, this.host, () => {
                const addr = this.server?.address() as AddressInfo | null;
                const boundPort = addr?.port ?? this.port;
                console.log(`[AdminWebServer] Panel local disponible en http://${this.host}:${boundPort}`);
                resolve(boundPort);
            });
        });
    }

    public stop(): Promise<void> {
        return new Promise(resolve => {
            if (!this.server) return resolve();
            this.server.close(() => {
                this.server = null;
                resolve();
            });
        });
    }

    private async route(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const url = new URL(req.url || '/', `http://${this.host}`);
        if (url.pathname === '/' && (req.method === 'GET' || !req.method)) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(DashboardHtmlView.render());
            return;
        }

        if (this.secret && url.pathname.startsWith('/api/')) {
            const provided = req.headers['x-admin-secret'] || url.searchParams.get('token');
            if (provided !== this.secret) {
                this.apiController.sendJson(res, 401, { ok: false, error: 'No autorizado (ADMIN_SECRET requerido).' });
                return;
            }
        }

        const body = await this.readJsonBody(req);
        const handled = await this.apiController.handle(req, res, url.pathname, body);
        if (!handled) {
            this.apiController.sendJson(res, 404, { ok: false, error: 'Ruta no encontrada.' });
        }
    }

    private readJsonBody(req: IncomingMessage): Promise<any> {
        return new Promise((resolve, reject) => {
            if (req.method === 'GET' || req.method === 'HEAD') return resolve(null);
            let raw = '';
            req.on('data', chunk => {
                raw += chunk;
                if (raw.length > 65_536) reject(new Error('Payload demasiado grande.'));
            });
            req.on('end', () => {
                if (!raw.trim()) return resolve({});
                try { resolve(JSON.parse(raw)); } catch { reject(new Error('JSON inválido.')); }
            });
            req.on('error', err => reject(err));
        });
    }
}

