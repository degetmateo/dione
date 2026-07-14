import path from 'path';
import fs from 'fs';
import Bot from "../extensions/bot";

const load = (bot: Bot) => {
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        event.once ?
            bot.once(event.name, (...args) => event.execute(...args)) :
            bot.on(event.name, (...args) => event.execute(...args));
    };
};

const eventsHandler = {
    load
};

export default eventsHandler;