import { ModalSubmitInteraction } from 'discord.js';

export interface IModalHandler {
    readonly id: string;
    execute(interaction: ModalSubmitInteraction, data: any): Promise<void>;
}

