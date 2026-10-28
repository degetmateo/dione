import { MessageFlags, User, ChatInputCommandInteraction } from 'discord.js';
import { ApiClientFactory } from '../../../../infrastructure/external-apis/api-client.factory';
import { ErrorEmbed, CharacterInfoCardComponent } from '../../../ui';
import mongo from '../../../../database/mongo';
import Helpers from '../../../../helpers';
import { InteractionStateService } from '../../../../infrastructure/cache/interaction-state.service';
import { I18nService } from '../../../../core/i18n/i18n.service';

export class CharacterGetByIdHandler {
    private static async upsertCharacter(data: any, existing: any): Promise<number> {
        const images = [{ url: data.image.large || data.image.medium }];
        const name = data.name.full || data.name.userPreferred;
        if (existing) {
            if (!existing.updated_at || Helpers.hasPassedMoreThanAMonth(existing.updated_at, new Date())) {
                await mongo.characters.updateOne(
                    { _id: existing._id },
                    { $set: { updated_at: new Date(), name, favourites: data.favourites, media: data.media.nodes, images } }
                );
            }
            return existing.claimed_count || 0;
        }
        await mongo.characters.insertOne({
            _id: data.id, url: data.siteUrl, gender: data.gender || null, age: data.age || null,
            favourites: data.favourites || 0, name, media: data.media.nodes, images, claimed_count: 0, updated_at: new Date(),
        });
        return 0;
    }

    public static async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        const loc = interaction.locale;
        const args = Number(interaction.options.getString('name-or-id', true));
        const anilist = ApiClientFactory.getAniListClient();
        const data = await anilist.get.character.id(args);

        if (!data) {
            const notFound = I18nService.t(loc, 'api.notFound', { service: 'AniList' });
            await interaction.reply({ flags: 'Ephemeral', embeds: [new ErrorEmbed(notFound)] });
            return;
        }

        const character = await mongo.characters.findOne({ _id: data.id });
        const claimedCount = await this.upsertCharacter(data, character);
        const claim = await mongo.claims.findOne({ _id: `${interaction.guildId}_${data.id}` as any });
        const owner: User | undefined = claim ? await interaction.client.users.fetch(claim.user_id) : undefined;

        const popularMedia = data.media.nodes.sort((a: any, b: any) => b.favourites - a.favourites);
        const selectedMedia = popularMedia[0];
        const interactionId = InteractionStateService.getInstance().set({}, 120_000);

        const card = new CharacterInfoCardComponent({
            id: data.id, name: data.name.full, fav_count: data.favourites, url: data.siteUrl,
            interaction_id: interactionId, owner,
            media: { id: selectedMedia.id, siteUrl: selectedMedia.siteUrl, title: selectedMedia.title.userPreferred },
            claimed_count: claimedCount, image: { url: data.image.large || data.image.medium },
            gender: data.gender || null, age: data.age || null, bloodType: data.bloodType || null, locale: loc,
        });

        InteractionStateService.getInstance().update(interactionId, { index: 0, cards: [card] }, 120_000);
        await interaction.reply({ flags: [MessageFlags.IsComponentsV2], components: [card] });
    }
}

