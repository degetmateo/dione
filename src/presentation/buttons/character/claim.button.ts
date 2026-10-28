import { ButtonInteraction, MessageFlags, TextDisplayBuilder } from 'discord.js';
import { IButtonHandler } from '../../discord/button.interface';
import membersRepository from '../../../repositories/members/members.repository';
import charactersRepository from '../../../repositories/characters/characters.repository';
import mongo from '../../../database/mongo';
import { InteractionStateService } from '../../../infrastructure/cache/interaction-state.service';
import { I18nService } from '../../../core/i18n/i18n.service';

export class ClaimButton implements IButtonHandler {
    public readonly id = 'claim-button';

    public async execute(interaction: ButtonInteraction, character: any): Promise<void> {
        const loc = interaction.locale;
        if (!character) {
            await interaction.reply({
                flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
                components: [new TextDisplayBuilder().setContent(I18nService.t(loc, 'common.expiredInteraction'))],
            });
            return;
        }

        const memberWhoWantsToClaim: any = await membersRepository.findsert(
            interaction.user.id,
            interaction.guild?.id as string
        );

        if (memberWhoWantsToClaim.gacha.claims <= 0) {
            await interaction.reply({
                flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
                components: [new TextDisplayBuilder().setContent(
                    '**¡Te has quedado sin claims!** Volverás a tener `2 claims` en la siguiente hora (esto no se acumula). También puedes comprar `1 claim` por `100 renas` en `/gacha buy-claims`.'
                )],
            });
            return;
        }

        const race = InteractionStateService.getInstance().consume(character.key);
        if (!race) {
            await interaction.reply({
                flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
                components: [new TextDisplayBuilder().setContent('¡Se te han adelantado!')],
            });
            return;
        }

        await mongo.claims.insertOne({
            _id: `${interaction.guild?.id}_${character._id}` as any,
            guild_id: interaction.guild?.id,
            character_id: character._id,
            user_id: interaction.user.id,
        });

        membersRepository.decreaseClaims(memberWhoWantsToClaim._id);
        membersRepository.increaseClaimCount(memberWhoWantsToClaim._id);
        charactersRepository.increaseClaimCount(character._id);

        await interaction.reply({
            flags: [MessageFlags.IsComponentsV2],
            components: [new TextDisplayBuilder().setContent(`¡<@${interaction.user.id}> ha reclamado a **${character.name}**!`)],
        });
    }
}

