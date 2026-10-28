import { ButtonInteraction, MessageFlags } from 'discord.js';
import { IButtonHandler } from '../../discord/button.interface';
import { ErrorEmbed, SuccessEmbed } from '../../ui';
import mongo from '../../../database/mongo';
import { I18nService } from '../../../core/i18n/i18n.service';

export class CharacterFavButton implements IButtonHandler {
    public readonly id = 'character-fav-button';

    public async execute(interaction: ButtonInteraction, data: any): Promise<void> {
        if (!data) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed(I18nService.t(interaction.locale, 'common.expiredInteraction'))],
            });
            return;
        }

        const charData = data.cards[data.index].character_data;
        const _id = `${interaction.guild?.id}_${charData.id}_${interaction.user.id}` as any;
        const fav = await mongo.favourites.findOne({ _id });

        if (fav) {
            await mongo.favourites.deleteOne({ _id });
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed(`¡Ya no quieres a **${charData.name}**!`)],
            });
            return;
        }

        await mongo.favourites.insertOne({
            _id,
            user_id: interaction.user.id,
            guild_id: interaction.guild?.id,
            character_id: charData.id,
        });

        await interaction.reply({
            flags: [MessageFlags.Ephemeral],
            embeds: [new SuccessEmbed(`¡Has indicado que quieres a **${charData.name}**!`)],
        });
    }
}

