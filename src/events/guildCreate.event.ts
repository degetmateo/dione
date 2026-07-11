import { Events, Guild } from "discord.js";
import * as uuid from 'uuid';
import mongo from "../database/mongo";
import { UUID } from "mongodb";

module.exports = {
    name: Events.GuildCreate,
    once: false,
    execute: async (guild: Guild) => {
        try {
            const guilds = mongo.collection('guilds');
            const _id = uuid.v7();
            await guilds.insertOne({
                _id: new UUID(_id) as any,
                discord_id: guild.id
            });
        } catch (error) {
            console.error(error);
        };
    }
};