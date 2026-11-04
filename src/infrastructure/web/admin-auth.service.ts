import crypto from 'node:crypto';
import { IncomingMessage } from 'node:http';
import { OsCredentialVerifier } from './os-credential.verifier';

export interface AdminAuthOptions {
    password?: string;
    secret?: string;
    sessionTtlMs?: number;
    osVerifier?: OsCredentialVerifier;
}

export class AdminAuthService {
    private static readonly COOKIE_NAME = 'dione_session';
    private static readonly MAX_ATTEMPTS = 5;
    private static readonly WINDOW_MS = 5 * 60 * 1000;

    private readonly signingKey = crypto.randomBytes(32);
    private readonly attempts = new Map<string, { count: number; resetAt: number }>();
    private readonly customPassword: string;
    private readonly headerSecret: string;
    private readonly sessionTtlMs: number;
    private readonly osVerifier: OsCredentialVerifier;

    public constructor(options: AdminAuthOptions = {}) {
        this.customPassword = options.password ?? process.env.ADMIN_PASSWORD ?? '';
        this.headerSecret = options.secret ?? process.env.ADMIN_SECRET ?? '';
        this.sessionTtlMs = options.sessionTtlMs ?? 12 * 60 * 60 * 1000;
        this.osVerifier = options.osVerifier ?? new OsCredentialVerifier();
    }

    public getDefaultUsername(): string { return this.osVerifier.getDefaultUsername(); }
    public hasCustomPassword(): boolean { return Boolean(this.customPassword); }

    public isRateLimited(ip: string): boolean {
        const entry = this.attempts.get(ip);
        if (!entry) return false;
        if (Date.now() > entry.resetAt) { this.attempts.delete(ip); return false; }
        return entry.count >= AdminAuthService.MAX_ATTEMPTS;
    }

    public async authenticate(username: string, password: string, clientIp: string): Promise<string | null> {
        if (this.isRateLimited(clientIp)) return null;
        const user = username?.trim() || this.getDefaultUsername();
        const valid = this.customPassword
            ? this.safeCompare(password || '', this.customPassword)
            : await this.osVerifier.verify(user, password || '');

        if (!valid) { this.recordFailure(clientIp); return null; }
        this.attempts.delete(clientIp);
        const payload = Buffer.from(JSON.stringify({ u: user, exp: Date.now() + this.sessionTtlMs })).toString('base64url');
        return `${payload}.${crypto.createHmac('sha256', this.signingKey).update(payload).digest('base64url')}`;
    }

    public isRequestAuthorized(req: IncomingMessage, url: URL): boolean {
        if (this.headerSecret) {
            const provided = String(req.headers['x-admin-secret'] || url.searchParams.get('token') || '');
            if (provided && this.safeCompare(provided, this.headerSecret)) return true;
        }
        const token = this.extractSessionCookie(req.headers.cookie);
        return token ? this.verifySessionToken(token) : false;
    }

    public buildSessionCookie(token: string): string {
        return `${AdminAuthService.COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${Math.floor(this.sessionTtlMs / 1000)}`;
    }

    public buildLogoutCookie(): string {
        return `${AdminAuthService.COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0`;
    }

    private verifySessionToken(token: string): boolean {
        const [payload, sig] = token.split('.');
        if (!payload || !sig) return false;
        const expected = crypto.createHmac('sha256', this.signingKey).update(payload).digest('base64url');
        if (!this.safeCompare(sig, expected)) return false;
        try {
            return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'))?.exp > Date.now();
        } catch { return false; }
    }

    private extractSessionCookie(cookieHeader?: string): string | null {
        for (const part of (cookieHeader || '').split(';')) {
            const [k, ...v] = part.trim().split('=');
            if (k === AdminAuthService.COOKIE_NAME && v.length) return v.join('=');
        }
        return null;
    }

    private recordFailure(ip: string): void {
        const cur = this.attempts.get(ip);
        const resetAt = !cur || Date.now() > cur.resetAt ? Date.now() + AdminAuthService.WINDOW_MS : cur.resetAt;
        this.attempts.set(ip, { count: !cur || Date.now() > cur.resetAt ? 1 : cur.count + 1, resetAt });
    }

    private safeCompare(a: string, b: string): boolean {
        return Buffer.byteLength(a) === Buffer.byteLength(b) && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    }
}
