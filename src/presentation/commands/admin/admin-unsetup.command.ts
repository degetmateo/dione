import {
    ChatInputCommandInteraction,
    InteractionContextType,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from 'discord.js';
import { BaseSlashCommand } from '../../discord/base.slash-command';
import { MembershipModel } from '../../../infrastructure/database/schemas/membership.schema';
import { SuccessEmbed } from '../../ui';
import { ValidationError } from '../../../core/errors/validation-error';

export class AdminUnsetupCommand extends BaseSlashCommand {
    public readonly name = 'admin-unsetup';
    public override readonly cooldown = 5;

    public readonly data = new SlashCommandBuilder()
        .setName('admin-unsetup')
        .setDescription('Desvincular un usuario de este servidor.')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setNSFW(false)
        .addUserOption(option =>
            option.setName('user').setDescription('El usuario a desvincular.').setRequired(false)
        )
        .addStringOption(option =>
            option.setName('user-id').setDescription('La ID del usuario a desvincular.').setRequired(false)
        );

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const targetUser = interaction.options.getUser('user', false);
        const targetUserId = interaction.options.getString('user-id', false);

        if (!targetUser && !targetUserId) {
            throw new ValidationError('Debes ingresar al menos un usuario o su ID.', 'user');
        }

        const userId = targetUser ? targetUser.id : targetUserId!;
        await MembershipModel.deleteOne({ _id: `${interaction.guildId}_${userId}` });

        await interaction.reply({
            flags: [MessageFlags.Ephemeral],
            embeds: [new SuccessEmbed(`Hemos desvinculado a <@${userId}> correctamente de este servidor.`)],
        });
    }
}

