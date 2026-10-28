import { ChatInputCommandInteraction, InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { BaseSlashCommand } from '../../discord/base.slash-command';
import { HelpEmbed } from '../../ui';

export class HelpCommand extends BaseSlashCommand {
    public readonly name = 'help';
    public override readonly cooldown = 5;

    public readonly data = new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all the commands.')
        .setDescriptionLocalization('es-ES', 'Muestra todos los comandos de Dione.')
        .setDescriptionLocalization('es-419', 'Muestra todos los comandos de Dione.')
        .setContexts(InteractionContextType.Guild)
        .setNSFW(false);

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.reply({
            embeds: [new HelpEmbed()],
            flags: [MessageFlags.Ephemeral],
        });
    }
}

