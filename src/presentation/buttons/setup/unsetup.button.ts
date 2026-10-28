import { ButtonInteraction, MessageFlags } from 'discord.js';
import { IButtonHandler } from '../../discord/button.interface';
import mongo from '../../../database/mongo';
import { SuccessEmbed } from '../../ui';

export class UnsetupButton implements IButtonHandler {
    public readonly id = 'unsetup-button';

    public async execute(interaction: ButtonInteraction): Promise<void> {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        await mongo.users.deleteOne({ _id: interaction.user.id as any });
        await mongo.memberships.deleteOne({ _id: `${interaction.guild?.id}_${interaction.user.id}` as any });

        await interaction.editReply({
            embeds: [new SuccessEmbed('Eliminé todos los datos de tu perfil correctamente.')],
        });
    }
}

