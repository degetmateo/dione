import { MessageFlags, ModalSubmitInteraction } from 'discord.js';
import { IModalHandler } from '../../discord/modal.interface';
import { ErrorEmbed, SetupSuccessEmbed } from '../../ui';
import { ApiClientFactory } from '../../../infrastructure/external-apis/api-client.factory';
import mongo from '../../../database/mongo';
import { InteractionStateService } from '../../../infrastructure/cache/interaction-state.service';
import { I18nService } from '../../../core/i18n/i18n.service';

export class SetupInstructionsAnilistModal implements IModalHandler {
    public readonly id = 'setup-instructions-anilist-modal';

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
        const token = interaction.fields.getTextInputValue('setup-instructions-anilist-input');
        const anilist = ApiClientFactory.getAniListClient();
        const viewer = await anilist.viewer(token);

        const query = await mongo.users.findOneAndUpdate(
            { _id: member._id },
            { $set: { preferred_platform: 'anilist', anilist: { id: viewer.id, token } } },
            { upsert: false }
        );

        if (!query) {
            await interaction.editReply({
                embeds: [new ErrorEmbed(I18nService.t(loc, 'common.notRegistered'))],
            });
            return;
        }

        if (member.caches) {
            member.caches.forEach((c: string) => InteractionStateService.getInstance().delete(c));
        }

        await interaction.editReply({
            embeds: [new SetupSuccessEmbed(viewer.name, viewer.siteUrl, loc)],
        });
    }
}

