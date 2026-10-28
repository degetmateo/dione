import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
} from 'discord.js';
import { BaseSlashCommand } from '../../discord/base.slash-command';
import { MongoUserRepository } from '../../../infrastructure/repositories/mongo-user.repository';
import { MembershipModel } from '../../../infrastructure/database/schemas/membership.schema';
import { InteractionStateService } from '../../../infrastructure/cache/interaction-state.service';

export class SetupCommand extends BaseSlashCommand {
    public readonly name = 'setup';
    public override readonly cooldown = 30;

    public readonly data = new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup or customize your profile.')
        .setDescriptionLocalization('es-ES', 'Crea o customiza tu perfil.')
        .setDescriptionLocalization('es-419', 'Crea o customiza tu perfil.')
        .setNSFW(false)
        .setContexts(InteractionContextType.Guild);

    constructor(private readonly userRepo = new MongoUserRepository()) {
        super();
    }

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const userId = interaction.user.id;
        const guildId = interaction.guildId!;

        const user = await this.userRepo.findOrCreate(userId, guildId);
        await MembershipModel.updateOne(
            { _id: `${guildId}_${userId}` },
            { $setOnInsert: { guild_id: guildId, user_id: userId, show_scores: true } },
            { upsert: true }
        );

        const cacheId = InteractionStateService.getInstance().set(user, 60_000);

        const embed = new EmbedBuilder()
            .setColor(Colors.DarkOrange)
            .setDescription(
                '**¡Perfil configurado!**\n¿Deseas customizarlo o vincular una plataforma?\n\n' +
                '▸ Ten en cuenta que `MyAnimeList` y `VNDB` aún poseen ciertas limitaciones de API.'
            );

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(`setup-profile-button_${cacheId}`).setLabel('Customizar').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`setup-anilist-button_${cacheId}`).setLabel('ANILIST').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`setup-mal-button_${cacheId}`).setLabel('MyAnimeList').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`setup-vndb-button_${cacheId}`).setLabel('VNDB').setStyle(ButtonStyle.Secondary)
        );

        await interaction.editReply({ embeds: [embed], components: [row] });
    }
}

