import { ActivitiesOptions, ActivityType, Events } from 'discord.js';
import Bot from '../extensions/bot';

module.exports = {
	name: Events.ClientReady,
	once: true,
    execute: (client: Bot) => {
        console.log(`✅ Logged in as ${client.user.tag}`);

        let index = 0;        
        setInterval(() => {
            const activities: ActivitiesOptions[] = [
                {
                    name: '/help',
                    type: ActivityType.Listening
                },
                {
                    name: `${client.guilds.cache.size} servidores!`,
                    type: ActivityType.Watching
                }
            ];

            client.user.setPresence({
                afk: false,
                status: 'online',
                activities: [activities[index]]
            });

            index++;
            if (index > activities.length - 1) index = 0;
        }, 60_000);
    }
};