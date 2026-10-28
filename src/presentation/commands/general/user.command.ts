import { ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { BaseSlashCommand } from '../../discord/base.slash-command';
import { UserViewHandler } from './user/user-view.handler';

export class UserCommand extends BaseSlashCommand {
    public readonly name = 'user';
    public override readonly cooldown = 25;

    public readonly data = new SlashCommandBuilder()
        .setName('user')
        .setDescription('All the information related to a user.')
        .setDescriptionLocalization('es-ES', 'Toda la información y perfil de un usuario.')
        .setDescriptionLocalization('es-419', 'Toda la información y perfil de un usuario.')
        .setContexts(InteractionContextType.Guild)
        .setNSFW(false)
        .addUserOption(option =>
            option
                .setName('member')
                .setDescription('The user to get information for.')
                .setDescriptionLocalization('es-ES', 'El usuario del que obtener información.')
                .setRequired(false)
        );

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await UserViewHandler.handle(interaction);
    }
}

