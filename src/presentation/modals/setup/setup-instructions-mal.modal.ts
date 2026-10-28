import { MessageFlags, ModalSubmitInteraction } from 'discord.js';
import { IModalHandler } from '../../discord/modal.interface';
import { ErrorEmbed, SetupSuccessEmbed } from '../../ui';
import { ApiClientFactory } from '../../../infrastructure/external-apis/api-client.factory';
import mongo from '../../../database/mongo';
import { I18nService } from '../../../core/i18n/i18n.service';

export class SetupInstructionsMalModal implements IModalHandler {
    public readonly id = 'setup-instructions-mal-modal';

    public async execute(interaction: ModalSubmitInteraction, data: any): Promise<void> {
        const loc = interaction.locale;
        if (!data) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed(I18nService.t(loc, 'common.expiredInteraction'))],
            });
            return;
        }

        if (interaction.user.id !== data._id) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed(I18nService.t(loc, 'common.unauthorized'))],
            });
            return;
        }

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const codes = interaction.fields.getTextInputValue('setup-instructions-mal-input');
        const [code, state] = codes.split('_');

        if (!code || !state || interaction.user.id !== state) {
            await interaction.editReply({
                embeds: [new ErrorEmbed(I18nService.t(loc, 'api.invalidToken', { service: 'MAL' }))],
            });
            return;
        }

        const mal = ApiClientFactory.getMalClient();
        const tokens = await mal.token(code, data.code_verifier);
        const maluser = await mal.user.me(tokens.access_token);

        await mongo.users.updateOne(
            { _id: data._id as any },
            {
                $set: {
                    preferred_platform: 'mal',
                    mal: {
                        id: maluser.id,
                        name: maluser.name,
                        joined_at: new Date(maluser.joined_at),
                        auth: {
                            token_type: tokens.token_type,
                            expires_in: tokens.expires_in,
                            access_token: tokens.access_token,
                            refresh_token: tokens.refresh_token,
                        },
                    },
                },
            }
        );

        await interaction.editReply({
            embeds: [new SetupSuccessEmbed(maluser.name, `https://myanimelist.net/profile/${maluser.name}`, loc)],
        });
    }
}

