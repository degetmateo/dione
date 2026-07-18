import { Client, Collection, GatewayIntentBits, SlashCommandBuilder } from "discord.js";
import eventsHandler from "../handlers/events.handler";
import commandsHandler from "../handlers/commands.handler";

export default class Bot extends Client<true> {
    public commands: Collection<string, {
        cooldown: number;
        data: SlashCommandBuilder,
        execute: Function
    }>;

    public cooldowns: Collection<string, Collection<string, any>>;

    public cache: Map<string, any>;

    constructor () {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildPresences
            ]
        });

        this.commands = new Collection();
        this.cooldowns = new Collection();
        this.cache = new Map<string, any>();

        eventsHandler.load(this);
        commandsHandler.load(this);
    };
};