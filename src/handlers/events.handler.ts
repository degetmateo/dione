import path from 'path';
import fs from 'fs';
import Bot from "../extensions/bot";

class EventsHandler {
    private bot: Bot;

    constructor (bot: Bot) {
        this.bot = bot;
    };

    public load () {
        const eventsPath = path.join(__dirname, '../events');
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);

            event.once ?
                this.bot.once(event.name, (...args) => event.execute(...args)) :
                this.bot.on(event.name, (...args) => event.execute(...args));
        };
    };
};

export default EventsHandler;