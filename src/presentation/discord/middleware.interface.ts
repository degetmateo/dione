import { ChatInputCommandInteraction } from 'discord.js';

export type NextFunction = () => Promise<void>;

export interface ICommandMiddleware {
    handle(interaction: ChatInputCommandInteraction, next: NextFunction): Promise<void>;
}

