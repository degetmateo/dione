import { ChatInputCommandInteraction } from "discord.js";
import GenericError from "../../errors/genericError";
import searchUser from "./searchUser";
import UserEmbed from "../../embeds/userEmbed";
import AnilistUser from "../../models/anilist/anilistUser";
import mongo from "../../database/mongo";
import GuildChatInputCommandInteraction from "../../extensions/guildChatInputCommandInteraction.extension";

export default class UserCommandInteraction {
    private interaction: GuildChatInputCommandInteraction;
    
    constructor (interaction: GuildChatInputCommandInteraction) {
        this.interaction = interaction;
    };

    async execute () {
        await this.interaction.deferReply();

        const memberId = this.interaction.options.getUser('member')?.id || this.interaction.user.id;

        const members = mongo.collection('members');
        const member = await members.findOne({ discord_id: memberId });

        if (!member) throw new GenericError(`<@${memberId}> no está registrado.`);

        const user = await searchUser(member.anilist.id);

        await this.interaction.editReply({
            embeds: [new UserEmbed(new AnilistUser(user))]
        });
    };
};