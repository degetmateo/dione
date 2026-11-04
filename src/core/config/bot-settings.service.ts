import fs from 'node:fs/promises';
import path from 'node:path';
import { BotSettings, DEFAULT_BOT_SETTINGS, MediaApiProviderMode } from './settings.types';

const VALID_PROVIDERS: MediaApiProviderMode[] = ['auto', 'anilist', 'mal'];

export class BotSettingsService {
    private static instance: BotSettingsService | null = null;
    private current: BotSettings = { ...DEFAULT_BOT_SETTINGS };
    private readonly filePath: string;

    public constructor(filePath?: string) {
        this.filePath = filePath ?? path.join(process.cwd(), 'settings.json');
    }

    public static getInstance(): BotSettingsService {
        if (!this.instance) {
            this.instance = new BotSettingsService();
        }
        return this.instance;
    }

    public get(): BotSettings {
        return this.current;
    }

    public setInMemory(partial: Partial<BotSettings>): BotSettings {
        Object.assign(this.current, this.sanitize(partial));
        return this.current;
    }

    public async load(): Promise<BotSettings> {
        try {
            const raw = await fs.readFile(this.filePath, 'utf-8');
            const parsed = JSON.parse(raw) as Partial<BotSettings>;
            Object.assign(this.current, DEFAULT_BOT_SETTINGS, this.sanitize(parsed));
            return this.current;
        } catch (error: any) {
            if (error?.code === 'ENOENT') {
                await this.save(DEFAULT_BOT_SETTINGS);
            }
            Object.assign(this.current, DEFAULT_BOT_SETTINGS);
            return this.current;
        }
    }

    public async save(partial: Partial<BotSettings>): Promise<BotSettings> {
        this.setInMemory(partial);
        const json = JSON.stringify(this.current, null, 2);
        await fs.writeFile(this.filePath, json, 'utf-8');
        return this.current;
    }

    private sanitize(input: Partial<BotSettings>): Partial<BotSettings> {
        const clean: Partial<BotSettings> = {};
        if (typeof input.maintenance === 'boolean') clean.maintenance = input.maintenance;
        if (input.maintenance_reason !== undefined) {
            const trimmed = input.maintenance_reason ? String(input.maintenance_reason).trim() : '';
            clean.maintenance_reason = trimmed.length > 0 ? trimmed : null;
        }
        const rawProv = input.media_api_provider as string | undefined;
        const normalizedProv = rawProv === 'jikan' ? 'mal' : rawProv;
        if (normalizedProv && VALID_PROVIDERS.includes(normalizedProv as MediaApiProviderMode)) {
            clean.media_api_provider = normalizedProv as MediaApiProviderMode;
        }
        if (typeof input.renas_per_reclaim === 'number' && input.renas_per_reclaim >= 0) {
            clean.renas_per_reclaim = Math.floor(input.renas_per_reclaim);
        }
        if (typeof input.character_claim_cooldown === 'number' && input.character_claim_cooldown >= 0) {
            clean.character_claim_cooldown = Math.floor(input.character_claim_cooldown);
        }
        if (Array.isArray(input.devs)) {
            clean.devs = input.devs.map(String);
        }
        return clean;
    }
}
