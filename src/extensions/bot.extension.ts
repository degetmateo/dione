import { Client, Collection, GatewayIntentBits, SlashCommandBuilder } from "discord.js";
import eventsHandler from "../handlers/events.handler";
import commandsHandler from "../handlers/commands.handler";
import buttonsHandler from "../handlers/buttons.handler";
import modalsHandler from "../handlers/modals.handler";

export default class Bot extends Client<true> {
    public commands: Collection<string, {
        cooldown: number;
        data: SlashCommandBuilder,
        execute: Function
    }>;

    public buttons: Collection<string, {
        id: string;
        execute: Function
    }>;

    public modals: Collection<string, {
        id: string;
        execute: Function;
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
        this.buttons = new Collection();
        this.modals = new Collection();
        this.cooldowns = new Collection();
        this.cache = new Map<string, any>();

        eventsHandler.load(this);
        commandsHandler.load(this);
        buttonsHandler.load(this);
        modalsHandler.load(this);
    };

    set (data: any, expireIn?: number) {
        const key = Date.now().toString(36);
        
        if (!data.caches) data.caches = [];
        data.caches.push(key);

        this.cache.set(key, data);

        setTimeout(() => {
            this.cache.delete(key);
        }, expireIn || 60_000);

        return key;
    };

    get (key: string) {
        return this.cache.get(key);
    };

    delete (key: string) {
        this.cache.delete(key);
    };
};