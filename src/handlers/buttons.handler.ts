import path from 'path';
import fs from 'fs';
import Bot from '../extensions/bot';

class ButtonsHandler {
    private bot: Bot;
    public paths: string[];

    constructor (bot: Bot) {
        this.bot = bot;
        this.paths = [];
    };

    public load () {
        this.paths = [];
        
        const foldersPath = path.join(__dirname, '../interactions/buttons');
        const buttonsFolders = fs.readdirSync(foldersPath);

        for (const folder of buttonsFolders) {
            const buttonsPath = path.join(foldersPath, folder);
            const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));
            
            for (const file of buttonFiles) {
                const filePath = path.join(buttonsPath, file);
                const button = require(filePath);

                if ('id' in button && 'execute' in button) {
                    this.bot.buttons.set(button.id, button);
                    this.paths.push(filePath);
                } else {
                    console.log(`🟧 | The command at ${filePath} is missing a required "id" or "execute" property.`);
                };
            };
        };
    };

    public reload () {
        for (const p of this.paths) {
            delete require.cache[require.resolve(p)];
            const newButton = require(p);
            this.bot.buttons.set(newButton.id, newButton);
        };

        this.load();
    };
};

export default ButtonsHandler;