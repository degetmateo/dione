import { ChatInputCommandInteraction, Client } from "discord.js";
import { RawInteractionData } from '../../node_modules/discord.js/typings/rawDataTypes';
import Bot from "./bot";

export default class BChatInputCommandInteraction extends ChatInputCommandInteraction {
    public client: Bot;

    constructor (client: Client<true>, data: RawInteractionData) {
        super(client, data);
        this.client = client as Bot;
    };
};