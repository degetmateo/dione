import { ChatInputCommandInteraction, Client, Guild, TextBasedChannel } from "discord.js";
import { RawInteractionData } from '../../node_modules/discord.js/typings/rawDataTypes';
import Bot from "../bot/bot";

export default class GuildChatInputCommandInteraction extends ChatInputCommandInteraction {
    public override client: Bot;

    public override get guild(): Guild {
        return super.guild as Guild;
    }

    public override get channel(): TextBasedChannel {
        return super.channel as TextBasedChannel;
    }

    public data: any;

    constructor (client: Client<true>, data: RawInteractionData) {
        super(client, data);
        this.client = client as Bot;
    }
}
