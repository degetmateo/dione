import { ChatInputCommandInteraction, MessageFlags, User } from 'discord.js';
import mongo from '../../../../database/mongo';
import { GachaInventoryComponent } from '../../../ui';
import { InteractionStateService } from '../../../../infrastructure/cache/interaction-state.service';

export class GachaInventorySubcommand {
    public static async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply();
        const optionsUser: User = interaction.options.getUser('user', false) || interaction.user;
        const loc = interaction.locale;

        const claims = await mongo.claims.find({
            guild_id: interaction.guildId,
            user_id: optionsUser.id,
        }).toArray();

        const claimedCharacters: any = await mongo.characters.find({
            _id: { $in: claims.map(claim => claim.character_id) },
        }).sort({ favourites: 'desc' }).toArray();

        const splittedCharacters: Array<Array<{ name: string; url: string }>> = [];
        let temp: Array<{ name: string; url: string }> = [];

        for (const c of claimedCharacters) {
            temp.push(c);
            if (temp.length === 20) {
                splittedCharacters.push(temp);
                temp = [];
            }
        }
        if (temp.length > 0) {
            splittedCharacters.push(temp);
        }

        const cards: GachaInventoryComponent[] = [];
        const id = InteractionStateService.getInstance().set({}, 120_000);
        const total = splittedCharacters.length;
        const showIndex = total > 1;

        for (let i = 0; i < total; i++) {
            cards.push(new GachaInventoryComponent({
                id,
                user: optionsUser,
                characters: splittedCharacters[i],
                pageNumber: i + 1,
                pageTotal: total,
                showIndex,
                locale: loc,
            }));
        }

        InteractionStateService.getInstance().update(id, { cards, index: 0 }, 120_000);

        await interaction.editReply({
            flags: [MessageFlags.IsComponentsV2],
            components: [cards[0]],
        });
    }
}

