import { BotSettingsService } from '../core/config/bot-settings.service';
import { BotSettings } from '../core/config/settings.types';

export type Settings = BotSettings;

export class SettingsModule {
    public static async read(): Promise<Settings> {
        return BotSettingsService.getInstance().load();
    }

    public static async save(settings: Partial<Settings>): Promise<void> {
        await BotSettingsService.getInstance().save(settings);
    }
}

export default SettingsModule;
