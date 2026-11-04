import os from 'node:os';

export class LanNetworkHelper {
    public static getLanUrls(port: number): string[] {
        const nets = os.networkInterfaces();
        const urls: string[] = [];
        for (const list of Object.values(nets)) {
            if (!list) continue;
            for (const iface of list) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    urls.push(`http://${iface.address}:${port}`);
                }
            }
        }
        return urls;
    }

    public static isLocalOrLanAddress(rawIp?: string | null): boolean {
        if (!rawIp) return false;
        const ip = rawIp.startsWith('::ffff:') ? rawIp.slice(7) : rawIp;
        if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return true;
        if (ip.startsWith('fe80:') || ip.startsWith('fc') || ip.startsWith('fd')) return true;

        const parts = ip.split('.').map(Number);
        if (parts.length !== 4 || parts.some(n => Number.isNaN(n) || n < 0 || n > 255)) {
            return false;
        }
        const [a, b] = parts;
        if (a === 127 || a === 10) return true;
        if (a === 192 && b === 168) return true;
        if (a === 172 && b >= 16 && b <= 31) return true;
        if (a === 169 && b === 254) return true;
        return false;
    }
}

