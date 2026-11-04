/// <reference path="../env.d.ts" />

import Bot from './bot/bot';
import mongo from './database/mongo';
import GachaSchedulerModule from './modules/gacha.scheduler.module';
import { TOKEN } from './consts';
import { ProcessProtection } from './core/resilience/process-protection';
import { MongooseService } from './infrastructure/database/mongoose.service';
import { AdminWebServer } from './infrastructure/web/admin-web.server';
import SettingsModule from './modules/settings.module';

const init = async () => {
    ProcessProtection.initialize();

    await SettingsModule.read();
    await mongo.init();

    if (process.env.MONGODB_DATABASE_KEY) {
        await MongooseService.connect(
            process.env.MONGODB_DATABASE_KEY,
            process.env.MONGODB_DATABASE_NAME
        ).catch(err => console.error('Mongoose fallback:', err));
    }

    const bot = new Bot();
    const adminServer = new AdminWebServer(bot);
    await adminServer.start().catch(err => console.error('[AdminWebServer] No se pudo iniciar:', err));

    await bot.login(TOKEN);
    GachaSchedulerModule.SCHEDULE_PULLS_RESET(bot);
};

init();
