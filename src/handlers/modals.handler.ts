import path from 'path';
import fs from 'fs';
import Bot from "../extensions/bot.extension";

const load = (bot: Bot) => {
    const dir = path.join(__dirname, '../modals');
    const files = fs.readdirSync(dir).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

    for (const file of files) {
        const fileDir = path.join(dir, file);
        const modal = require(fileDir);

        if ('id' in modal && 'execute' in modal) {
            bot.modals.set(modal.id, modal);
        } else {
            console.log(`🟧 | The modal at ${fileDir} is missing a required "id" or "execute" property.`);
        };
    };
};

const modalsHandler = {
    load
};

export default modalsHandler;