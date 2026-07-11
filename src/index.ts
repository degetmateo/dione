/// <reference path="../env.d.ts" />

import Bot from './extensions/bot';
import mongo from "./database/mongo";

const init = async () => {
    await mongo.init();
    new Bot().login(process.env.TOKEN);
};

init();