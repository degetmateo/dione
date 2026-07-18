import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, ModalSubmitInteraction } from "discord.js";
import searchAnimeById from "../command-interactions/anime/searchAnimeById";
import searchMangaById from "../command-interactions/manga/searchMangaById";
import GenericError from "../errors/genericError";
import ErrorEmbed from "../embeds/errorEmbed";
import ExchangeMediaEmbed from "../builders/embeds/exchangeMedia.embed";

const exchangeCreateModalExecute = async (interaction: ModalSubmitInteraction) => {
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

    await interaction.deferReply();

    const idMediaMemberB = interaction.fields.getTextInputValue('exchange_id_input');
    const valuesMediaMemberB = interaction.fields.getStringSelectValues('exchange_type_select');
    const typeMediaMemberB = valuesMediaMemberB[0];

    let mediaB;

    try {
        if (typeMediaMemberB === 'ANIME') {
            mediaB = await searchAnimeById(idMediaMemberB);
        } else if (typeMediaMemberB === 'MANGA') {
            mediaB = await searchMangaById(idMediaMemberB);
        } else {
            throw new GenericError();
        };
    } catch (error: any) {
        console.error(error);

        if (error.status === 404) {
            return await interaction.editReply({
                embeds: [new ErrorEmbed("No hemos encontrado una obra con el ID ingresado.")]
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
        memberBMediaID: idMediaMemberB
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

    await interaction.editReply({
        content: `<@${data.memberAID}>: ¿Quieres aceptar este intercambio?`,
        embeds: [new ExchangeMediaEmbed(mediaB)],
        components: [row]
    });
};

export default exchangeCreateModalExecute;