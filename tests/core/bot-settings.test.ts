import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { BotSettingsService } from '../../src/core/config/bot-settings.service';
import { MaintenanceMiddleware } from '../../src/presentation/discord/middlewares/maintenance.middleware';
import { BusinessRuleError } from '../../src/core/errors/business-rule-error';

describe('BotSettingsService & Maintenance Reason', () => {
    let tempFile: string;

    beforeEach(() => {
        tempFile = path.join(os.tmpdir(), `dione-settings-${Date.now()}-${Math.random()}.json`);
    });

    afterEach(async () => {
        await fs.unlink(tempFile).catch(() => {});
    });

    it('should create default settings file when missing and load defaults', async () => {
        const service = new BotSettingsService(tempFile);
        const loaded = await service.load();

        expect(loaded.maintenance).toBe(false);
        expect(loaded.media_api_provider).toBe('auto');
        expect(loaded.renas_per_reclaim).toBe(10);

        const raw = JSON.parse(await fs.readFile(tempFile, 'utf-8'));
        expect(raw.media_api_provider).toBe('auto');
    });

    it('should mutate shared settings reference in-place and sanitize invalid inputs', async () => {
        const service = new BotSettingsService(tempFile);
        const ref = service.get();

        await service.save({
            maintenance: true,
            maintenance_reason: '  Actualización programada  ',
            media_api_provider: 'mal',
            renas_per_reclaim: 25.9,
        });

        expect(ref.maintenance).toBe(true);
        expect(ref.maintenance_reason).toBe('Actualización programada');
        expect(ref.media_api_provider).toBe('mal');
        expect(ref.renas_per_reclaim).toBe(25);

        await service.save({
            media_api_provider: 'invalid-provider' as any,
            renas_per_reclaim: -50,
            maintenance_reason: '   ',
        });

        expect(ref.media_api_provider).toBe('mal');
        expect(ref.renas_per_reclaim).toBe(25);
        expect(ref.maintenance_reason).toBeNull();
    });

    it('should append maintenance_reason in MaintenanceMiddleware when present', async () => {
        const mw = new MaintenanceMiddleware();
        const mockInteraction: any = {
            commandName: 'anime',
            locale: 'es-ES',
            client: {
                settings: {
                    maintenance: true,
                    maintenance_reason: 'Migrando servidor local',
                },
            },
        };

        await expect(mw.handle(mockInteraction, async () => {})).rejects.toThrow(BusinessRuleError);
        try {
            await mw.handle(mockInteraction, async () => {});
        } catch (err: any) {
            expect(err.userMessage).toContain('Migrando servidor local');
        }
    });
});
