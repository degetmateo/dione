import path from 'path';
import fs from 'fs';
import { Collection } from 'discord.js';

class Handler {
    private path: string;
    private paths: string[];
    public collection: Collection<string, any>;

    constructor (path: string) {
        this.path = path;
        this.paths = [];
        this.collection = new Collection();
        this.load();
    };

    public load () {
        this.paths = [];
    
        const folders = fs.readdirSync(this.path);

        for (const folder of folders) {
            const filesPath = path.join(this.path, folder);
            const files = fs.readdirSync(filesPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));
            
            for (const file of files) {
                const filePath = path.join(filesPath, file);
                const module = require(filePath);

                if ('id' in module && 'execute' in module) {
                    this.collection.set(module.id, module);
                    this.paths.push(filePath);
                } else {
                    console.log(`🟧 | The module at ${filePath} is missing a required "id" or "execute" property.`);
                };
            };
        };
    };

    public reload () {
        for (const p of this.paths) {
            delete require.cache[require.resolve(p)];
            const module = require(p);
            this.collection.set(module.id, module);
        };

        this.load();
    };
};

export default Handler;