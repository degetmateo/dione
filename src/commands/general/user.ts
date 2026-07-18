import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import GenericError from "../../errors/genericError";
import mongo from "../../database/mongo";
import UserEmbed from "../../embeds/userEmbed";
import AnilistUser from "../../models/anilist/anilistUser";
import anilistUserRequest from "../../requests/anilistUser.request";
import GuildChatInputCommandInteraction from "../../extensions/guildChatInputCommandInteraction.extension";

const execute = async (interaction: GuildChatInputCommandInteraction) => {
    await interaction.deferReply();

    const memberId = interaction.options.getUser('member')?.id || interaction.user.id;

    const members = mongo.collection('members');
    const member = await members.findOne({ discord_id: memberId });

    if (!member) {
        if (memberId === interaction.user.id) {
            throw new GenericError(`No estás registrado. Usá \`/setup\` para registrarte.`);
        } else {
            throw new GenericError(`<@${memberId}> no está registrado. Debe usar \`/setup\` para registrarse.`);
        };
    };

    const user = await anilistUserRequest.execute(member.anilist.id);

    await interaction.editReply({
        embeds: [new UserEmbed(new AnilistUser(user))]
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