import { ChatInputCommandInteraction, InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { BaseSlashCommand } from '../../discord/base.slash-command';
import { PathNotesInfoCardComponent } from '../../ui';

export class PatchNotesCommand extends BaseSlashCommand {
    public readonly name = 'patch-notes';
    public override readonly cooldown = 10;

    public readonly data = new SlashCommandBuilder()
        .setName('patch-notes')
        .setDescription('List of the latest changes.')
        .setDescriptionLocalization('es-ES', 'Lista de los cambios recientes.')
        .setDescriptionLocalization('es-419', 'Lista de los cambios recientes.')
        .setContexts(InteractionContextType.Guild)
        .setNSFW(false);

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const avatarUrl = interaction.client.user?.avatarURL({ extension: 'png', size: 512 }) || '';
        await interaction.reply({
            flags: [MessageFlags.IsComponentsV2],
            components: [new PathNotesInfoCardComponent(avatarUrl)],
        });
    }
}

