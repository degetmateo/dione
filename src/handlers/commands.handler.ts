import path from 'path';
import fs from 'fs';
import Bot from '../extensions/bot';

class CommandsHandler {
    private bot: Bot;
    public paths: string[];

    constructor (bot: Bot) {
        this.bot = bot;
        this.paths = [];
    };

    public load () {
        this.paths = [];
        
        const foldersPath = path.join(__dirname, '../interactions/commands');
        const commandFolders = fs.readdirSync(foldersPath);

        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));
            
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);

                if ('data' in command && 'execute' in command) {
                    this.bot.commands.set(command.data.name, command);
                    this.paths.push(filePath);
                } else {
                    console.log(`🟧 | The command at ${filePath} is missing a required "data" or "execute" property.`);
                };
            };
        };
    };

    public reload () {
        for (const p of this.paths) {
            delete require.cache[require.resolve(p)];
            const newCommand = require(p);
            this.bot.commands.set(newCommand.data.name, newCommand);
        };

        this.load();
    };
};

export default CommandsHandler;