import { ChatInputCommandInteraction, Client, Guild } from "discord.js";
import { RawInteractionData } from '../../node_modules/discord.js/typings/rawDataTypes';
import Bot from "./bot.extension";

export default class GuildChatInputCommandInteraction extends ChatInputCommandInteraction {
    public client: Bot;
    
    public get guild(): Guild {
        return this.guild;
    }

    constructor (client: Client<true>, data: RawInteractionData) {
        super(client, data);
        this.client = client as Bot;
    };
};