import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { BusinessRuleError } from '../../../../core/errors';
import Helpers from '../../../../helpers';
import mongo from '../../../../database/mongo';
import { GachaTradeErrorComponent, GachaTradeConfirmCardComponent } from '../../../ui';
import { InteractionStateService } from '../../../../infrastructure/cache/interaction-state.service';
import { I18nService } from '../../../../core/i18n/i18n.service';

export class GachaTradeSubcommand {
    private static async findCharacter(query: string) {
        if (Helpers.isNumber(query)) {
            return await mongo.characters.findOne({ _id: Number(query) as any });
        }
        return await mongo.characters.findOne({ name: { $regex: query, $options: 'i' } });
    }

    public static async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        const loc = interaction.locale;
        const optionsUser = interaction.options.getUser('user', true);

        if (interaction.user.id === optionsUser.id) {
            throw new BusinessRuleError(I18nService.t(loc, 'gacha.tradeSelfError'));
        }

        const [argA, argB] = [interaction.options.getString('ca_name-or-id', true), interaction.options.getString('cb_name-or-id', true)];
        const characterA = await this.findCharacter(argA);
        if (!characterA) throw new BusinessRuleError(I18nService.t(loc, 'gacha.characterNotFound'));

        const claimA = await mongo.claims.findOne({
            guild_id: interaction.guildId,
            user_id: interaction.user.id,
            character_id: characterA._id,
        });
        if (!claimA) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
                components: [new GachaTradeErrorComponent(characterA.name, characterA.images[0].url, loc)],
            });
            return;
        }

        const characterB = await this.findCharacter(argB);
        if (!characterB) throw new BusinessRuleError(I18nService.t(loc, 'gacha.characterNotFound'));

        const claimB = await mongo.claims.findOne({
            guild_id: interaction.guildId,
            user_id: optionsUser.id,
            character_id: characterB._id,
        });
        if (!claimB) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
                components: [new GachaTradeErrorComponent(characterB.name, characterB.images[0].url, loc)],
            });
            return;
        }

        const id = InteractionStateService.getInstance().set({ optionsUser, characterA, characterB }, 30_000);
        const comp = new GachaTradeConfirmCardComponent({
            id,
            aCharacterName: characterA.name,
            bCharacterName: characterB.name,
            aCharacterImageURL: characterA.images[0].url,
            bCharacterImageURL: characterB.images[0].url,
            locale: loc,
        });

        await interaction.reply({
            flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
            components: [comp],
        });
    }
}

