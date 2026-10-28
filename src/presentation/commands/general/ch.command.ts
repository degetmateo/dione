import {
    ChatInputCommandInteraction,
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
    TextDisplayBuilder,
    User,
} from 'discord.js';
import { BaseSlashCommand } from '../../discord/base.slash-command';
import { DrawCharacterUseCase } from '../../../application/use-cases/draw-character.use-case';
import { CharacterClaimCardComponent } from '../../ui';
import { InteractionStateService } from '../../../infrastructure/cache/interaction-state.service';

export class ChCommand extends BaseSlashCommand {
    public readonly name = 'ch';
    public override readonly cooldown = 5;

    public readonly data = new SlashCommandBuilder()
        .setName('ch')
        .setDescription('Tirar por un personaje al azar para reclamar.')
        .setContexts(InteractionContextType.Guild)
        .setNSFW(false);

    constructor(private readonly drawUseCase = new DrawCharacterUseCase()) {
        super();
    }

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            const { character, ownerId, favourites } = await this.drawUseCase.execute(
                interaction.user.id,
                interaction.guildId!,
                interaction.channelId
            );

            let owner: User | null = null;
            if (ownerId) {
                owner = await interaction.client.users.fetch(ownerId).catch(() => null);
            }
            character.owner_id = owner?.id;

            const cacheId = InteractionStateService.getInstance().set(character, 60_000);
            const popularMedia = character.media?.slice().sort((a: any, b: any) => b.favourites - a.favourites);

            const card = new CharacterClaimCardComponent({
                id: Number(character._id),
                name: character.name,
                image: character.images[0],
                url: character.url,
                media: popularMedia?.[0] ?? null,
                claimed_count: character.claimed_count || 0,
                fav_count: character.favourites || 0,
                owner,
                interaction_id: cacheId,
                users_who_want: favourites,
            });

            await interaction.reply({
                flags: [MessageFlags.IsComponentsV2],
                components: [card],
            });
        } catch (error: any) {
            if (error.message === 'OUT_OF_PULLS') {
                await interaction.reply({
                    flags: [MessageFlags.IsComponentsV2],
                    components: [
                        new TextDisplayBuilder().setContent(this.t(interaction, 'gacha.outOfPulls')),
                        new TextDisplayBuilder().setContent(this.t(interaction, 'gacha.outOfPullsResetInfo')),
                    ],
                });
                return;
            }
            throw error;
        }
    }
}

