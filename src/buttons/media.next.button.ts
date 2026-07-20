import { ButtonInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import ErrorEmbed from "../embeds/errorEmbed";
import ScoresEmbed from "../embeds/scoresEmbed";
import Bot from "../extensions/bot.extension";
import anilist from "../apis/anilist/anilist";

module.exports = {
    id: 'media-next-button',
    execute: async (interaction: ButtonInteraction, data: {
        key: string;
        members: any[];
        embeds: EmbedBuilder[];
        media: any[];
        scores: any[];
        index: number;
    }) => {
        if (!data) {
            return await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed('Esta interacción ha expirado.')]
            });
        };

        data.index = data.index + 1;
        if (data.index > data.embeds.length - 1) data.index = 0;

        if (!data.scores[data.index]) {
            if (data.members.length <= 0) {
                data.scores[data.index] = new ErrorEmbed('¡Parece que nadie conoce esto!');
            } else {
                const s = await anilist.search.scores(data.media[data.index].id, data.members.map(m => m.anilist.id));

                data.scores[data.index] = s.length > 0 ?
                    new ScoresEmbed(s) :
                    new ErrorEmbed('¡Parece que nadie conoce esto!');
            };
        };

        const bot = interaction.client as Bot;
        bot.update(data.key, data);

        await interaction.update({
            embeds: [data.embeds[data.index], data.scores[data.index]]
        });
    }
};