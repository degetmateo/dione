import { Events, GuildMember } from "discord.js";
import mongo from "../database/mongo";

module.exports = {
    name: Events.GuildMemberRemove,
    once: false,
    execute: async (guildMember: GuildMember) => {
        try {        
            const members = mongo.collection('members');
            const member = await members.findOne({ discord_id: guildMember.id });

            if (!member) return;

            const guilds = member.guilds.filter((g: any) => g.id != guildMember.guild.id);

            await members.updateOne(
                { _id: member._id },
                { $set: { guilds } }
            );
        } catch (error) {
            console.error(error);  
        };
    }
};