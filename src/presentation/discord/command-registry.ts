import { ISlashCommand } from './command.interface';
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';

export class CommandRegistry {
    private readonly commands = new Map<string, ISlashCommand>();

    public register(command: ISlashCommand): void {
        if (this.commands.has(command.name)) {
            console.warn(`⚠️ [COMMAND REGISTRY]: Overwriting command '${command.name}'`);
        }
        this.commands.set(command.name, command);
    }

    public registerAll(commands: ISlashCommand[]): void {
        for (const cmd of commands) {
            this.register(cmd);
        }
    }

    public get(name: string): ISlashCommand | undefined {
        return this.commands.get(name);
    }

    public getAll(): ISlashCommand[] {
        return Array.from(this.commands.values());
    }

    public has(name: string): boolean {
        return this.commands.has(name);
    }

    public toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
        return this.getAll().map(cmd => cmd.data.toJSON() as RESTPostAPIChatInputApplicationCommandsJSONBody);
    }
}

