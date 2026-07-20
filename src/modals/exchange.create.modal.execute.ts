import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, ModalSubmitInteraction } from "discord.js";
import GenericError from "../errors/genericError";
import ErrorEmbed from "../embeds/errorEmbed";
import AnimeEmbed from "../embeds/animeEmbed";
import MangaEmbed from "../embeds/mangaEmbed";
import anilist from "../apis/anilist/anilist";

module.exports = {
    id: 'exchange-create-modal',
    execute: async (interaction: ModalSubmitInteraction) => {
        const values = interaction.customId.split('_');

        const bot: any = interaction.client;

        const data: {
            memberAID: string;
            memberBID: string;
            memberAMediaType: string;
            memberBMediaID: string;
            caches: string[];
        } = bot.cache.get(values[1]);

        if (!data) {
            return await interaction.reply({
                flags: [MessageFlags.Ephemeral],
                embeds: [new ErrorEmbed('¡Este intercambio ya expiró!')]
            });
        };

        const idMediaMemberB = interaction.fields.getTextInputValue('exchange_id_input');
        const valuesMediaMemberB = interaction.fields.getStringSelectValues('exchange_type_select');
        const typeMediaMemberB = valuesMediaMemberB[0];

        if (data.memberAMediaType == typeMediaMemberB) {
            if (data.memberBMediaID == idMediaMemberB) {
                return await interaction.reply({
                    flags: [MessageFlags.Ephemeral],
                    embeds: [new ErrorEmbed('¡No pueden intercambiar la misma obra!')]
                });
            };
        };

        await interaction.deferReply();

        let mediaB;

        try {
            if (typeMediaMemberB === 'ANIME') {
                mediaB = await anilist.search.anime.id(idMediaMemberB);
            } else if (typeMediaMemberB === 'MANGA') {
                mediaB = await anilist.search.manga.id(idMediaMemberB);
            } else {
                throw new GenericError();
            };
        } catch (error: any) {
            console.error(error);

            if (error.status === 404) {
                return await interaction.editReply({
                    embeds: [new ErrorEmbed(`<@${interaction.user.id}>: No hemos encontrado una obra con el ID ingresado.`)]
                });
            } else {
                return await interaction.editReply({
                    embeds: [new ErrorEmbed(error.message)]
                });
            };
        };

        const newData = {
            ...data,
            memberBMediaType: typeMediaMemberB,
            memberBMediaID: idMediaMemberB,
            memberBMediaName: mediaB.title.userPreferred
        };

        const cacheID = Date.now().toString(36);

        newData.caches.push(cacheID);

        bot.cache.set(cacheID, newData);

        setTimeout(() => {
            bot.cache.delete(cacheID);
        }, 180_000);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder({
                    style: ButtonStyle.Success,
                    customId: `exchange-create-button-finish_${cacheID}`,
                    label: '¡Aceptar intercambio!'
                })
            );

        const embed = newData.memberBMediaType === 'ANIME' ?
            new AnimeEmbed(mediaB) : new MangaEmbed(mediaB);

        await interaction.editReply({
            content: `<@${data.memberAID}>: ¿Quieres aceptar este intercambio?`,
            embeds: [embed],
            components: [row]
        });
    }
};