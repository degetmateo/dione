import { ChatInputCommandInteraction } from 'discord.js';
import { SuccessEmbed } from '../../../ui';
import { BusinessRuleError } from '../../../../core/errors';
import membersRepository from '../../../../repositories/members/members.repository';
import { I18nService } from '../../../../core/i18n/i18n.service';

export class GachaBuyClaimsSubcommand {
    public static async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        const loc = interaction.locale;
        const claims = interaction.options.getNumber('claims', true);
        const price = claims * 100;

        const user: any = await membersRepository.findsert(interaction.user.id, interaction.guildId as string);
        if (user.renas < price) {
            throw new BusinessRuleError(I18nService.t(loc, 'gacha.insufficientRenas', { price }));
        }

        await membersRepository.buyClaims(user._id, claims, price);
        await interaction.reply({
            flags: 'Ephemeral',
            embeds: [new SuccessEmbed(I18nService.t(loc, 'gacha.claimsPurchased', { claims }))],
        });
    }
}

