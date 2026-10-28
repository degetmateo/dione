import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

export type SlashCommandData =
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;

export interface ISlashCommand {
    readonly name: string;
    readonly cooldown: number;
    readonly data: SlashCommandData;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

