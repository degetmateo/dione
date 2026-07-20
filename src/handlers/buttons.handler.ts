import path from 'path';
import fs from 'fs';
import Bot from "../extensions/bot.extension";

const load = (bot: Bot) => {
    const dir = path.join(__dirname, '../buttons');
    const files = fs.readdirSync(dir).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

    for (const file of files) {
        const fileDir = path.join(dir, file);
        const button = require(fileDir);

        if ('id' in button && 'execute' in button) {
            bot.buttons.set(button.id, button);
        } else {
            console.log(`🟧 | The command at ${fileDir} is missing a required "id" or "execute" property.`);
        };
    };
};

const buttonsHandler = {
    load
};

export default buttonsHandler;