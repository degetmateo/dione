import { ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { BaseSlashCommand } from '../../discord/base.slash-command';
import { ApiClientFactory } from '../../../infrastructure/external-apis/api-client.factory';
import { VNEmbed } from '../../ui';
import mongo from '../../../database/mongo';
import { VnScoresEmbed as VNScoresEmbed } from '../../ui';
import { ErrorEmbed } from '../../ui';
import { VNRowComponent } from '../../ui';
import { InteractionStateService } from '../../../infrastructure/cache/interaction-state.service';

export class VnCommand extends BaseSlashCommand {
    public readonly name = 'vn';
    public override readonly cooldown = 10;

    public readonly data = new SlashCommandBuilder()
        .setName('vn')
        .setDescription('Search a Visual Novel on VNDB.')
        .setDescriptionLocalization('es-ES', 'Busca una novela visual en VNDB.')
        .setContexts(InteractionContextType.Guild)
        .setNSFW(false)
        .addStringOption(option =>
            option.setName('name-or-id').setDescription('Name or ID of the Visual Novel.').setRequired(true)
        );

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply();
        const vndb = ApiClientFactory.getVndbClient();
        const args = interaction.options.getString('name-or-id', true);
        const data = await vndb.vn(args);
        const media = data.results;

        const vnsEmbeds = media.map((vn: any) => new VNEmbed(vn));
        const scoresEmbeds: EmbedBuilder[] = [];

        const memberships = await mongo.memberships.find({ guild_id: interaction.guildId, show_scores: true }).toArray();
        const users = await mongo.users.find({
            _id: { $in: memberships.map(m => m.user_id) },
            vndb: { $ne: null },
        }).toArray();

        let index = 0;
        const selectedUsers = users.slice(0, 5);
        const scores = await vndb.scores(selectedUsers.map(user => ({
            userId: user.vndb.id,
            username: user.vndb.username,
            userToken: user.vndb.auth.token,
            vnId: media[index].id,
        })));

        scoresEmbeds[index] = scores.length > 0
            ? new VNScoresEmbed(scores)
            : new ErrorEmbed('No hay votos de miembros de este servidor para esta novela visual.');

        if (media.length === 1) {
            await interaction.editReply({ embeds: [vnsEmbeds[index], scoresEmbeds[index]] });
            return;
        }

        const cacheId = InteractionStateService.getInstance().set({ users: selectedUsers, media, index, vnsEmbeds, scoresEmbeds }, 60_000);

        await interaction.editReply({
            embeds: [vnsEmbeds[index], scoresEmbeds[index]],
            components: [new VNRowComponent(cacheId)],
        });
    }
}

