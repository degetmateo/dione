import { ChatInputCommandInteraction } from 'discord.js';
import { ISlashCommand, SlashCommandData } from './command.interface';
import { I18nService } from '../../core/i18n/i18n.service';

export abstract class BaseSlashCommand implements ISlashCommand {
    public abstract readonly name: string;
    public readonly cooldown: number = 3;
    public abstract readonly data: SlashCommandData;

    public abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;

    protected getLocale(interaction: ChatInputCommandInteraction): string {
        return interaction.locale;
    }

    protected t(
        interaction: ChatInputCommandInteraction,
        key: string,
        params: Record<string, string | number> = {}
    ): string {
        return I18nService.t(this.getLocale(interaction), key, params);
    }
}

