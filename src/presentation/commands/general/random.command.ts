import { ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { BaseSlashCommand } from '../../discord/base.slash-command';
import { UserModel } from '../../../infrastructure/database/schemas/user.schema';
import { ApiClientFactory } from '../../../infrastructure/external-apis/api-client.factory';
import Helpers from '../../../helpers';
import { AnimeEmbed } from '../../ui';
import { MangaEmbed } from '../../ui';
import { BusinessRuleError } from '../../../core/errors/business-rule-error';

export class RandomCommand extends BaseSlashCommand {
    public readonly name = 'random';
    public override readonly cooldown = 5;

    public readonly data = new SlashCommandBuilder()
        .setName('random')
        .setDescription('Get a random anime or manga recommendation from your PTW list.')
        .setDescriptionLocalization('es-ES', 'Recomendación aleatoria de tu lista de pendientes en AniList.')
        .setNSFW(false)
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Anime or Manga.')
                .setDescriptionLocalization('es-ES', 'Anime o Manga.')
                .setRequired(true)
                .addChoices(
                    { name: 'Anime', value: 'ANIME' },
                    { name: 'Manga', value: 'MANGA' }
                )
        );

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply();
        const type = interaction.options.getString('type', true) as 'ANIME' | 'MANGA';

        const user = await UserModel.findById(interaction.user.id);
        if (!user || !user.anilist) {
            throw new BusinessRuleError('Este comando requiere tener una cuenta de AniList vinculada mediante `/setup`.');
        }

        const anilist = ApiClientFactory.getAniListClient();
        const mediaList = await anilist.random({ type, user_id: String(user.anilist.id) });
        if (!mediaList || mediaList.length === 0) {
            throw new BusinessRuleError(`¡No tienes ${type.toLowerCase()} en tu lista de pendientes (PTW)!`);
        }

        const selected: any = Helpers.getRandomElement(mediaList);
        const embed = type === 'ANIME' ? new AnimeEmbed(selected.data) : new MangaEmbed(selected.data);

        await interaction.editReply({ embeds: [embed] });
    }
}
