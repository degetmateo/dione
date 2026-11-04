import http, { IncomingMessage, Server, ServerResponse } from 'node:http';
import { AddressInfo } from 'node:net';
import Bot from '../../bot/bot';
import { BotSettingsService } from '../../core/config/bot-settings.service';
import { AdminApiController } from './admin-api.controller';
import { AdminAuthService, AdminAuthOptions } from './admin-auth.service';
import { DashboardHtmlView } from './dashboard-html.view';
import { DashboardLoginView } from './dashboard-login.view';
import { LanNetworkHelper } from './lan-network.helper';

export interface AdminServerOptions extends AdminAuthOptions {
    port?: number;
    host?: string;
    allowPublicNetwork?: boolean;
    settingsService?: BotSettingsService;
}

export class AdminWebServer {
    private server: Server | null = null;
    private readonly port: number;
    private readonly host: string;
    private readonly allowPublicNetwork: boolean;
    private readonly authService: AdminAuthService;
    private readonly apiController: AdminApiController;

    public constructor(bot: Bot, options: AdminServerOptions = {}) {
        this.port = options.port ?? (Number(process.env.PORT) || 3000);
        this.host = options.host ?? process.env.ADMIN_HOST ?? '0.0.0.0';
        this.allowPublicNetwork = options.allowPublicNetwork ?? false;
        this.authService = new AdminAuthService(options);
        this.apiController = new AdminApiController(bot, options.settingsService);
    }

    public start(): Promise<number> {
        return new Promise((resolve, reject) => {
            this.server = http.createServer((req, res) => {
                this.route(req, res).catch(err => this.apiController.sendJson(res, 400, { ok: false, error: err?.message || 'Error interno' }));
            });
            this.server.once('error', err => reject(err));
            this.server.listen(this.port, this.host, () => {
                const boundPort = (this.server?.address() as AddressInfo | null)?.port ?? this.port;
                const lan = LanNetworkHelper.getLanUrls(boundPort);
                console.log(`[AdminWebServer] Local: http://localhost:${boundPort}` + (lan.length ? ` | LAN: ${lan.join(', ')}` : ''));
                resolve(boundPort);
            });
        });
    }

    public stop(): Promise<void> {
        return new Promise(resolve => {
            if (!this.server) return resolve();
            this.server.close(() => { this.server = null; resolve(); });
        });
    }

    private async route(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const clientIp = req.socket.remoteAddress || '';
        if (!this.allowPublicNetwork && !LanNetworkHelper.isLocalOrLanAddress(clientIp)) {
            return this.apiController.sendJson(res, 403, { ok: false, error: 'Acceso restringido a red local (LAN).' });
        }
        const url = new URL(req.url || '/', 'http://localhost');
        if (url.pathname === '/api/auth/login' && req.method === 'POST') return this.handleLogin(req, res, clientIp);
        if (url.pathname === '/api/auth/logout' && req.method === 'POST') {
            res.setHeader('Set-Cookie', this.authService.buildLogoutCookie());
            return this.apiController.sendJson(res, 200, { ok: true });
        }
        const authorized = this.authService.isRequestAuthorized(req, url);
        if (url.pathname === '/' && (req.method === 'GET' || !req.method)) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
            res.end(authorized ? DashboardHtmlView.render() : DashboardLoginView.render(this.authService.getDefaultUsername(), this.authService.hasCustomPassword()));
            return;
        }
        if (!authorized) return this.apiController.sendJson(res, 401, { ok: false, error: 'No autenticado. Inicia sesión primero.' });

        const body = await this.readJsonBody(req);
        if (!(await this.apiController.handle(req, res, url.pathname, body))) {
            this.apiController.sendJson(res, 404, { ok: false, error: 'Ruta no encontrada.' });
        }
    }

    private async handleLogin(req: IncomingMessage, res: ServerResponse, clientIp: string): Promise<void> {
        if (this.authService.isRateLimited(clientIp)) return this.apiController.sendJson(res, 429, { ok: false, error: 'Demasiados intentos. Espera 5 minutos.' });
        const body = await this.readJsonBody(req);
        const token = await this.authService.authenticate(body?.username, body?.password, clientIp);
        if (!token) return this.apiController.sendJson(res, 401, { ok: false, error: 'Usuario o contraseña del equipo incorrectos.' });
        res.setHeader('Set-Cookie', this.authService.buildSessionCookie(token));
        this.apiController.sendJson(res, 200, { ok: true });
    }

    private readJsonBody(req: IncomingMessage): Promise<any> {
        return new Promise((resolve, reject) => {
            if (req.method === 'GET' || req.method === 'HEAD') return resolve(null);
            let raw = '';
            req.on('data', c => { raw += c; if (raw.length > 65_536) reject(new Error('Payload demasiado grande.')); });
            req.on('end', () => { if (!raw.trim()) return resolve({}); try { resolve(JSON.parse(raw)); } catch { reject(new Error('JSON inválido.')); } });
            req.on('error', err => reject(err));
        });
    }
}
