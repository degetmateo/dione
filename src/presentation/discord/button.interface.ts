import { ButtonInteraction } from 'discord.js';

export interface IButtonHandler {
    readonly id: string;
    execute(interaction: ButtonInteraction, data: any): Promise<void>;
}

