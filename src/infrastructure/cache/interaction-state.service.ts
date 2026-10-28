import { randomUUID } from 'crypto';

interface SessionEntry<T> {
    data: T;
    expiresAt: number;
    timer: NodeJS.Timeout;
}

export class InteractionStateService {
    private static instance: InteractionStateService | null = null;
    private readonly sessions = new Map<string, SessionEntry<any>>();
    private readonly maxCapacity: number;

    constructor(maxCapacity: number = 5000) {
        this.maxCapacity = maxCapacity;
    }

    public static getInstance(): InteractionStateService {
        if (!this.instance) {
            this.instance = new InteractionStateService();
        }
        return this.instance;
    }

    public set<T>(data: T, ttlMs: number = 60_000): string {
        if (this.sessions.size >= this.maxCapacity) {
            const oldestKey = this.sessions.keys().next().value;
            if (oldestKey) this.delete(oldestKey);
        }

        const id = randomUUID().replace(/-/g, '').slice(0, 16);
        const timer = setTimeout(() => this.delete(id), ttlMs);
        this.sessions.set(id, { data, expiresAt: Date.now() + ttlMs, timer });
        return id;
    }

    public get<T>(id: string): T | undefined {
        const entry = this.sessions.get(id);
        if (!entry) return undefined;
        if (Date.now() > entry.expiresAt) {
            this.delete(id);
            return undefined;
        }
        return entry.data as T;
    }

    public update<T>(id: string, data: T, ttlMs?: number): boolean {
        const entry = this.sessions.get(id);
        if (!entry) return false;

        clearTimeout(entry.timer);
        const duration = ttlMs ?? (entry.expiresAt - Date.now());
        const validDuration = Math.max(duration, 1000);
        const timer = setTimeout(() => this.delete(id), validDuration);

        this.sessions.set(id, { data, expiresAt: Date.now() + validDuration, timer });
        return true;
    }

    public delete(id: string): boolean {
        const entry = this.sessions.get(id);
        if (!entry) return false;
        clearTimeout(entry.timer);
        return this.sessions.delete(id);
    }

    public consume<T>(id: string): T | undefined {
        const data = this.get<T>(id);
        if (data !== undefined) this.delete(id);
        return data;
    }

    public has(id: string): boolean {
        return this.get(id) !== undefined;
    }

    public clear(): void {
        for (const entry of this.sessions.values()) {
            clearTimeout(entry.timer);
        }
        this.sessions.clear();
    }

    public size(): number {
        return this.sessions.size;
    }
}

