import { ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { BaseSlashCommand } from '../../discord/base.slash-command';
import { CalculateAffinityUseCase } from '../../../application/use-cases/calculate-affinity.use-case';
import { AffinityEmbed } from '../../ui';

export class AffinityCommand extends BaseSlashCommand {
    public readonly name = 'affinity';
    public override readonly cooldown = 10;

    public readonly data = new SlashCommandBuilder()
        .setName('affinity')
        .setDescription('Affinity between two users!')
        .setDescriptionLocalization('es-ES', '¡La afinidad entre dos usuarios!')
        .setDescriptionLocalization('es-419', '¡La afinidad entre dos usuarios!')
        .setContexts(InteractionContextType.Guild)
        .setNSFW(false)
        .addUserOption(option =>
            option
                .setName('member')
                .setDescription('The member you want to calculate the affinity with.')
                .setDescriptionLocalization('es-ES', 'El miembro con quien calcular afinidad.')
                .setRequired(true)
        )
        .addUserOption(option =>
            option
                .setName('member-b')
                .setDescription('Another member (optional, defaults to you).')
                .setDescriptionLocalization('es-ES', 'Otro miembro (opcional, por defecto tú).')
                .setRequired(false)
        );

    constructor(private readonly affinityUseCase = new CalculateAffinityUseCase()) {
        super();
    }

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply();
        const userA = interaction.options.getUser('member', true);
        const userB = interaction.options.getUser('member-b', false) || interaction.user;

        const result = await this.affinityUseCase.execute({
            guildId: interaction.guildId!,
            userAId: userA.id,
            userBId: userB.id,
            locale: interaction.locale,
        });

        await interaction.editReply({
            embeds: [new AffinityEmbed({
                affinity: result.pearson,
                userAId: result.userAId,
                userBId: result.userBId,
                locale: interaction.locale,
            })],
        });
    }
}
