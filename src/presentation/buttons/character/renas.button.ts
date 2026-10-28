import { ButtonInteraction, MessageFlags, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder } from 'discord.js';
import { IButtonHandler } from '../../discord/button.interface';
import { ErrorEmbed } from '../../ui';
import Bot from '../../../bot/bot';
import membersRepository from '../../../repositories/members/members.repository';
import { InteractionStateService } from '../../../infrastructure/cache/interaction-state.service';
import { I18nService } from '../../../core/i18n/i18n.service';

export class RenasButton implements IButtonHandler {
    public readonly id = 'renas-button';

    public async execute(interaction: ButtonInteraction, character: any): Promise<void> {
        const loc = interaction.locale;
        if (!character) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed(I18nService.t(loc, 'common.expiredInteraction'))],
            });
            return;
        }

        InteractionStateService.getInstance().delete(character.key);
        const bot = interaction.client as Bot;
        const owner = await bot.users.fetch(character.owner_id);
        const renas = bot.settings?.renas_per_reclaim ?? 50;

        if (character.owner_id !== interaction.user.id) {
            const dividedRenas = Math.floor(renas / 2);
            membersRepository.increaseRenas(character.owner_id, dividedRenas);
            membersRepository.increaseRenas(interaction.user.id, dividedRenas);

            const comps = [
                new TextDisplayBuilder().setContent(`¡**${character.name}** ` + I18nService.t(loc, 'ui.belongsTo', { owner: owner.displayName }) + '!'),
                new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
                new TextDisplayBuilder().setContent(I18nService.t(loc, 'gacha.renasGained', { amount: dividedRenas, user: owner.displayName }) + '\n'),
                new TextDisplayBuilder().setContent(I18nService.t(loc, 'gacha.renasGained', { amount: dividedRenas, user: interaction.user.displayName }) + '\n'),
            ];

            await interaction.reply({ flags: [MessageFlags.IsComponentsV2], components: comps });
            return;
        }

        membersRepository.increaseRenas(interaction.user.id, renas);
        const comps = [
            new TextDisplayBuilder().setContent(`¡**${character.name}** ` + I18nService.t(loc, 'ui.belongsTo', { owner: owner.displayName }) + '!'),
            new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
            new TextDisplayBuilder().setContent(I18nService.t(loc, 'gacha.renasGained', { amount: renas, user: interaction.user.displayName })),
        ];

        await interaction.reply({ flags: [MessageFlags.IsComponentsV2], components: comps });
    }
}

