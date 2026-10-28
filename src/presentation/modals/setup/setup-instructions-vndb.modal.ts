import { MessageFlags, ModalSubmitInteraction } from 'discord.js';
import { IModalHandler } from '../../discord/modal.interface';
import { ErrorEmbed, SetupSuccessEmbed } from '../../ui';
import { ApiClientFactory } from '../../../infrastructure/external-apis/api-client.factory';
import mongo from '../../../database/mongo';
import { I18nService } from '../../../core/i18n/i18n.service';

export class SetupInstructionsVndbModal implements IModalHandler {
    public readonly id = 'setup-instructions-vndb-modal';

    public async execute(interaction: ModalSubmitInteraction, member: any): Promise<void> {
        const loc = interaction.locale;
        if (!member) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed(I18nService.t(loc, 'common.expiredInteraction'))],
            });
            return;
        }

        if (interaction.user.id !== member._id) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed(I18nService.t(loc, 'common.unauthorized'))],
            });
            return;
        }

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const token = interaction.fields.getTextInputValue('setup-instructions-vndb-input');
        if (!token) {
            await interaction.editReply({
                embeds: [new ErrorEmbed(I18nService.t(loc, 'api.invalidToken', { service: 'VNDB' }))],
            });
            return;
        }

        const vndb = ApiClientFactory.getVndbClient();
        const authinfo = await vndb.auth(token);

        await mongo.users.updateOne(
            { _id: member._id as any },
            {
                $set: {
                    vndb: {
                        id: authinfo.id,
                        username: authinfo.username,
                        auth: { token, permissions: authinfo.permissions },
                    },
                },
            }
        );

        await interaction.editReply({
            embeds: [new SetupSuccessEmbed(authinfo.username, `https://vndb.org/${authinfo.id}`, loc)],
        });
    }
}

