import { ColorResolvable, ModalSubmitInteraction } from 'discord.js';
import { Filter, Document, MatchKeysAndValues, UpdateFilter } from 'mongodb';
import { IModalHandler } from '../../discord/modal.interface';
import { ErrorEmbed, SuccessEmbed } from '../../ui';
import mongo from '../../../database/mongo';
import { I18nService } from '../../../core/i18n/i18n.service';

export class SetupProfileModal implements IModalHandler {
    public readonly id = 'setup-profile-modal';

    public async execute(interaction: ModalSubmitInteraction): Promise<void> {
        const loc = interaction.locale;
        const colorValue = interaction.fields.getTextInputValue('setup-profile-modal-input-color').trim();
        const color = colorValue as ColorResolvable;

        const avatarURL = interaction.fields.getTextInputValue('setup-profile-modal-input-avatar-url').trim();
        const bannerURL = interaction.fields.getTextInputValue('setup-profile-modal-input-banner-url').trim();

        const filter: Filter<Document> = { _id: interaction.user.id as any };
        const set: MatchKeysAndValues<Document> = {
            'profile.color': colorValue.length > 0 ? color : null,
            'profile.avatar_url': avatarURL.length > 0 ? avatarURL : null,
            'profile.banner_url': bannerURL.length > 0 ? bannerURL : null,
        };

        const update: UpdateFilter<Document> = { $set: set };
        const user = await mongo.users.findOneAndUpdate(filter, update, { upsert: false });

        if (!user) {
            await interaction.reply({
                flags: 'Ephemeral',
                embeds: [new ErrorEmbed(I18nService.t(loc, 'common.notRegistered'))],
            });
            return;
        }

        await interaction.reply({
            flags: 'Ephemeral',
            embeds: [new SuccessEmbed('Has customizado tu perfil correctamente. Puedes verlo usando el comando `/user`.')],
        });
    }
}

