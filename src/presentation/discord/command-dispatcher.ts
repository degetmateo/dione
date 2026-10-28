import { ChatInputCommandInteraction } from 'discord.js';
import { CommandRegistry } from './command-registry';
import { ICommandMiddleware } from './middleware.interface';
import { InteractionErrorHandler } from '../../core/resilience/interaction-error-handler';
import { BusinessRuleError } from '../../core/errors/business-rule-error';

export class CommandDispatcher {
    private readonly middlewares: ICommandMiddleware[] = [];

    constructor(private readonly registry: CommandRegistry) {}

    public use(middleware: ICommandMiddleware): this {
        this.middlewares.push(middleware);
        return this;
    }

    public async dispatch(interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            const command = this.registry.get(interaction.commandName);
            if (!command) {
                throw new BusinessRuleError(
                    `Comando '/${interaction.commandName}' no encontrado.`,
                    'COMMAND_NOT_FOUND'
                );
            }

            const executePipeline = (index: number): Promise<void> => {
                if (index < this.middlewares.length) {
                    const middleware = this.middlewares[index];
                    return middleware.handle(interaction, () => executePipeline(index + 1));
                }
                return command.execute(interaction);
            };

            await executePipeline(0);
        } catch (error: unknown) {
            await InteractionErrorHandler.handle(interaction, error);
        }
    }
}

