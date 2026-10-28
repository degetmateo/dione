import { ChatInputCommandInteraction, InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { BaseSlashCommand } from '../../discord/base.slash-command';
import { MembershipModel } from '../../../infrastructure/database/schemas/membership.schema';
import { SuccessEmbed } from '../../ui';
import { I18nService } from '../../../core/i18n/i18n.service';

export class ShowScoresCommand extends BaseSlashCommand {
    public readonly name = 'show-scores';
    public override readonly cooldown = 10;

    public readonly data = new SlashCommandBuilder()
        .setName('show-scores')
        .setDescription('Show your scores for each anime being displayed in this server.')
        .setDescriptionLocalization('es-ES', 'Configura si mostrar tus notas en este servidor.')
        .setDescriptionLocalization('es-419', 'Configura si mostrar tus notas en este servidor.')
        .setNSFW(false)
        .setContexts(InteractionContextType.Guild)
        .addBooleanOption(option =>
            option
                .setName('enabled')
                .setDescription('If you want this feature to be enabled for you in this server.')
                .setDescriptionLocalization('es-ES', 'Activar o desactivar tus notas en este servidor.')
                .setRequired(true)
        );

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const enabled = interaction.options.getBoolean('enabled', true);
        const guildId = interaction.guildId!;
        const userId = interaction.user.id;
        const loc = interaction.locale;

        await MembershipModel.updateOne(
            { _id: `${guildId}_${userId}` },
            { $set: { guild_id: guildId, user_id: userId, show_scores: enabled } },
            { upsert: true }
        );

        const msgKey = enabled ? 'settings.showScoresEnabled' : 'settings.showScoresDisabled';
        const msg = I18nService.t(loc, msgKey);

        await interaction.editReply({ embeds: [new SuccessEmbed(msg)] });
    }
}
