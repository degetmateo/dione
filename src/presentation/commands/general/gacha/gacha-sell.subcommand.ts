import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, TextDisplayBuilder } from 'discord.js';
import { Document, WithId } from 'mongodb';
import mongo from '../../../../database/mongo';
import Helpers from '../../../../helpers';
import { ErrorEmbed } from '../../../ui';
import { InteractionStateService } from '../../../../infrastructure/cache/interaction-state.service';
import { I18nService } from '../../../../core/i18n/i18n.service';

export class GachaSellSubcommand {
    public static async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        const loc = interaction.locale;
        const args = interaction.options.getString('name-or-id', true);
        const optionsUser = interaction.options.getUser('user', true);
        const price = interaction.options.getNumber('price', true);

        if (price < 0) return;

        let character: WithId<Document> | null = null;
        if (Helpers.isNumber(args)) {
            character = await mongo.characters.findOne({ _id: Number(args) as any });
        } else {
            character = await mongo.characters.findOne({ name: { $regex: args, $options: 'i' } });
        }

        if (!character) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed(I18nService.t(loc, 'gacha.characterNotFound'))],
            });
            return;
        }

        const claim = await mongo.claims.findOne({
            guild_id: interaction.guildId,
            user_id: interaction.user.id,
            character_id: character._id,
        });

        if (!claim) {
            await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed(I18nService.t(loc, 'ui.tradeNotClaimedError', { name: character.name }))],
            });
            return;
        }

        const memId = InteractionStateService.getInstance().set({
            character, optionsUser, price, interactionUser: interaction.user, claim,
        }, 60_000);

        const component = new ContainerBuilder().setAccentColor(Helpers.getRandomRGBTuple());
        component.addTextDisplayComponents(
            new TextDisplayBuilder().setContent('### 👀 ¡Vas a ofrecer a un personaje!'),
            new TextDisplayBuilder().setContent(`Estás a punto de ofrecer a \`${character.name}\` por \`${price} renas\`.`),
            new TextDisplayBuilder().setContent(`Ten en cuenta que <@${optionsUser.id}> podrá aceptar esta compra instantáneamente.`)
        );

        if (character.images?.[0]?.url) {
            component.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(character.images[0].url))
            );
        }

        component.addTextDisplayComponents(new TextDisplayBuilder().setContent('### ¿Estás seguro de que quieres hacer esto?'));
        component.addActionRowComponents(
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(`gacha-sell-confirm-button_${memId}`)
                    .setEmoji('✅')
                    .setLabel('Confirmar')
                    .setStyle(ButtonStyle.Success)
            )
        );

        await interaction.reply({
            flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
            components: [component],
        });
    }
}

