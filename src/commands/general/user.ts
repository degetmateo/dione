import { EmbedBuilder, InteractionContextType, SlashCommandBuilder, User } from "discord.js";
import GenericError from "../../errors/genericError";
import mongo from "../../database/mongo";
import UserEmbed from "../../embeds/userEmbed";
import GuildChatInputCommandInteraction from "../../extensions/guildChatInputCommandInteraction.extension";
import anilist from "../../apis/anilist/anilist";
import Aniuser from "../../apis/anilist/models/aniuser";
import mal from "../../apis/mal/mal";

const execute = async (interaction: GuildChatInputCommandInteraction) => {
    await interaction.deferReply();

    const memberId = interaction.options.getUser('member')?.id || interaction.user.id;

    const members = mongo.collection('members');
    const member = await members.findOne({ 
        $and: [
            { discord_id: memberId },
            {
                $or: [
                    { anilist: { $ne: null } },
                    { mal: { $ne: null } }
                ]
            }
        ]
    });
    
    if (!member) {
        if (memberId === interaction.user.id) {
            throw new GenericError(`No estás registrado. Usá \`/setup\` para registrarte.`);
        } else {
            throw new GenericError(`<@${memberId}> no está registrado. Debe usar \`/setup\` para registrarse.`);
        };
    };

    let embed: EmbedBuilder;

    if (member.preferred_platform === 'mal') {
        const maluser: any = await mal.user.get({ id: member.mal.id, token: member.mal.auth.access_token });

        embed = new EmbedBuilder();
        embed.setThumbnail(maluser.picture);
        embed.setColor('Random');
        embed.setDescription(
            `**[${maluser.name}](https://myanimelist.net/profile/${maluser.name})**\n\n`+
            `▸ Se unió el \`${new Date(maluser.joined_at).toDateString()}\`\n`+
            `▸ Cumpleaños: \`${new Date(maluser.birthday).toDateString()}\`\n`+
            `▸ Género: \`${maluser.gender || 'desconocido'}\`\n`+
            `▸ Ubicación: \`${maluser.location || 'desconocida'}\`\n\n`+
            `**Estadísticas en Anime**\n\n`+
            `▸ Calificación Promedio: **[${maluser.anime_statistics.mean_score}]**\n`+
            `▸ Completados: **[${maluser.anime_statistics.num_items_completed}]**\n`+
            `▸ Abandonados: **[${maluser.anime_statistics.num_items_dropped}]**\n`+
            `▸ Episodios vistos: **[${maluser.anime_statistics.num_episodes}]**\n`+
            `▸ Días vistos: **[${maluser.anime_statistics.num_days_watched}]**\n`
        );
    } else {
        const aniuser = await anilist.search.user(member.anilist.id);
        embed = new UserEmbed(new Aniuser(aniuser));
    };

    await interaction.editReply({
        embeds: [embed]
    });
};

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('user')
        .setContexts(InteractionContextType.Guild)
        .setNSFW(false)
        .setDescription('User anilist information.')
        .setDescriptionLocalization('es-ES', 'Información de anilist de un usuario.')
        .setDescriptionLocalization('es-419', 'Información de anilist de un usuario.')
        .addUserOption(option => 
            option
                .setName('member')
                .setDescription('The user to get information for.')
                .setDescriptionLocalization('es-ES', 'El usuario del que obtener información.')
                .setDescriptionLocalization('es-419', 'El usuario del que obtener información.')
                .setRequired(false)),
    execute: execute
};