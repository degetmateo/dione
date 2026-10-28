import { ButtonInteraction, MessageFlags, TextDisplayBuilder } from 'discord.js';
import { IButtonHandler } from '../../discord/button.interface';
import mongo from '../../../database/mongo';
import { memoryModule } from '../../../modules/mem.module';

export class FavButton implements IButtonHandler {
    public readonly id = 'fav-button';

    public async execute(interaction: ButtonInteraction): Promise<void> {
        const characterId = interaction.customId.split('_')[2];
        const character = memoryModule.characters.find(char => Number(char._id) === Number(characterId));
        const _id = `${interaction.guild?.id}_${characterId}_${interaction.user.id}` as any;
        const fav = await mongo.favourites.findOne({ _id });

        if (fav) {
            await mongo.favourites.deleteOne({ _id });
            await interaction.reply({
                flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
                components: [new TextDisplayBuilder().setContent(`Has indicado que **no** quieres a \`${character?.name}\`.`)],
            });
            return;
        }

        await mongo.favourites.insertOne({
            _id,
            user_id: interaction.user.id,
            guild_id: interaction.guild?.id,
            character_id: character?._id,
        });

        await interaction.reply({
            flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
            components: [new TextDisplayBuilder().setContent(`Has indicado que quieres a \`${character?.name}\`.`)],
        });
    }
}

