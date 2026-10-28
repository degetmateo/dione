import { Interaction, MessageFlags, EmbedBuilder, Colors } from 'discord.js';
import { AppError, ExternalApiError, DatabaseError } from '../errors';
import GenericError from '../../errors/genericError';
import { I18nService } from '../i18n/i18n.service';

export class InteractionErrorHandler {
    public static async handle(interaction: Interaction, error: unknown): Promise<void> {
        console.error('❌ [INTERACTION ERROR]:', error);

        if (!interaction.isRepliable()) return;

        const locale = (interaction as any).locale;
        const embed = new EmbedBuilder().setColor(Colors.Red);

        if (error instanceof ExternalApiError) {
            const title = I18nService.t(locale, 'api.serviceUnavailableTitle', { service: error.service });
            embed.setTitle(`⚠️ ${title}`);
            const desc = error.code.includes('RATE_LIMIT')
                ? I18nService.t(locale, 'api.rateLimited', { service: error.service })
                : I18nService.t(locale, 'api.serviceUnavailable', { service: error.service });
            embed.setDescription(desc);
        } else if (error instanceof DatabaseError) {
            embed.setTitle(`💾 ${I18nService.t(locale, 'common.databaseErrorTitle')}`);
            embed.setDescription(I18nService.t(locale, 'common.databaseError'));
        } else if (error instanceof AppError) {
            embed.setDescription(error.userMessage);
        } else if (error instanceof GenericError) {
            embed.setDescription(error.message);
        } else {
            embed.setDescription(I18nService.t(locale, 'common.unexpectedError'));
        }

        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [embed] });
            } else {
                await interaction.reply({
                    embeds: [embed],
                    flags: [MessageFlags.Ephemeral],
                });
            }
        } catch (discordError) {
            console.error('⚠️ [DISCORD DISPATCH ERROR]: Failed to send error embed:', discordError);
        }
    }
}
