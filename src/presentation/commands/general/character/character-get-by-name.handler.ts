import { MessageFlags, ChatInputCommandInteraction } from 'discord.js';
import { ApiClientFactory } from '../../../../infrastructure/external-apis/api-client.factory';
import { ErrorEmbed, CharacterInfoCardComponent } from '../../../ui';
import mongo from '../../../../database/mongo';
import { InteractionStateService } from '../../../../infrastructure/cache/interaction-state.service';
import { I18nService } from '../../../../core/i18n/i18n.service';

export class CharacterGetByNameHandler {
    public static async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        const loc = interaction.locale;
        const args = interaction.options.getString('name-or-id', true);
        const anilist = ApiClientFactory.getAniListClient();
        const data = await anilist.get.character.name(args);

        if (!data || data.length === 0) {
            const notFound = I18nService.t(loc, 'api.notFound', { service: 'AniList' });
            await interaction.reply({ flags: 'Ephemeral', embeds: [new ErrorEmbed(notFound)] });
            return;
        }

        const claims = await mongo.claims.find({
            guild_id: interaction.guildId,
            character_id: { $in: data.map((c: any) => c.id) },
        }).toArray();

        const cards: CharacterInfoCardComponent[] = [];
        const key = InteractionStateService.getInstance().set({}, 120_000);

        for (const elem of data) {
            const claim = claims.find(c => c.character_id === elem.id);
            const images = [{ url: elem.image.large || elem.image.medium }];
            const popularMedia = elem.media.nodes.sort((a: any, b: any) => b.favourites - a.favourites);
            const selectedMedia = popularMedia[0];
            const owner = claim ? await interaction.client.users.fetch(claim.user_id) : undefined;

            cards.push(new CharacterInfoCardComponent({
                id: elem.id, name: elem.name.full, fav_count: elem.favourites, url: elem.siteUrl,
                interaction_id: key, owner,
                media: { id: selectedMedia.id, siteUrl: selectedMedia.siteUrl, title: selectedMedia.title.userPreferred },
                claimed_count: null, image: images[0], gender: elem.gender || null, age: elem.age || null,
                bloodType: elem.bloodType || null, page_buttons: data.length >= 1, locale: loc,
            }));
        }

        InteractionStateService.getInstance().update(key, { index: 0, cards }, 120_000);
        await interaction.reply({ flags: [MessageFlags.IsComponentsV2], components: [cards[0]] });
    }
}

