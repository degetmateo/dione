import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import GenericError from "../../errors/genericError";
import mongo from "../../database/mongo";
import UserEmbed from "../../embeds/userEmbed";
import GuildChatInputCommandInteraction from "../../extensions/guildChatInputCommandInteraction.extension";
import anilist from "../../apis/anilist/anilist";
import Aniuser from "../../apis/anilist/models/aniuser";

const execute = async (interaction: GuildChatInputCommandInteraction) => {
    await interaction.deferReply();

    const memberId = interaction.options.getUser('member')?.id || interaction.user.id;

    const members = mongo.collection('members');
    const member = await members.findOne({ 
        $and: [
            { discord_id: memberId }, 
            { anilist: { $ne: null }}
        ]
     });

    if (!member) {
        if (memberId === interaction.user.id) {
            throw new GenericError(`No estás registrado. Usá \`/setup\` para registrarte.`);
        } else {
            throw new GenericError(`<@${memberId}> no está registrado. Debe usar \`/setup\` para registrarse.`);
        };
    };

    const user = await anilist.search.user(member.anilist.id);

    await interaction.editReply({
        embeds: [new UserEmbed(new Aniuser(user))]
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