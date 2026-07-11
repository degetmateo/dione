import { Client, Collection, GatewayIntentBits, SlashCommandBuilder } from "discord.js";
import CommandsHandler from "../handlers/commands.handler";
import EventsHandler from "../handlers/events.handler";
import ButtonsHandler from "../handlers/buttons.handler";
import Handler from "../helpers/handler";
import path from "path";

export default class Bot extends Client<true> {
    public commandsHandler: CommandsHandler;
    public eventsHandler: EventsHandler;
    public buttonsHandler: ButtonsHandler;

    public modalsHandler: Handler;

    public commands: Collection<string, {
        cooldown: number;
        data: SlashCommandBuilder,
        execute: Function
    }>;

    public cooldowns: Collection<string, Collection<string, any>>;

    public buttons: Collection<string, {
        id: string;
        execute: Function;
    }>;

    constructor () {
        super({
            intents: [GatewayIntentBits.Guilds]
        });

        this.commands = new Collection();
        this.cooldowns = new Collection();
        this.buttons = new Collection();

        this.commandsHandler = new CommandsHandler(this);
        this.eventsHandler = new EventsHandler(this);
        this.buttonsHandler = new ButtonsHandler(this);
        
        this.modalsHandler = new Handler(path.join(__dirname, '../interactions/modals'));
        
        this.commandsHandler.load();
        this.eventsHandler.load();
        this.buttonsHandler.load();
    };
};