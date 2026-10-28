import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
} from 'discord.js';
import { BaseSlashCommand } from '../../discord/base.slash-command';
import { InteractionStateService } from '../../../infrastructure/cache/interaction-state.service';

export class UnsetupCommand extends BaseSlashCommand {
    public readonly name = 'unsetup';
    public override readonly cooldown = 60;

    public readonly data = new SlashCommandBuilder()
        .setName('unsetup')
        .setDescription('Eliminar tu perfil y datos del bot.')
        .setNSFW(false)
        .setContexts(InteractionContextType.Guild);

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const cacheId = InteractionStateService.getInstance().set({}, 60_000);

        const embed = new EmbedBuilder()
            .setColor(Colors.DarkRed)
            .setDescription(
                'Estás a punto de eliminar completamente tu perfil de `Dione`. **Esto supondrá la pérdida de todos los datos que tienes en el bot**. ¿Estás seguro de que deseas continuar?'
            );

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`unsetup-button_${cacheId}`)
                .setLabel('Eliminar mi perfil')
                .setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({
            flags: [MessageFlags.Ephemeral],
            embeds: [embed],
            components: [row],
        });
    }
}

