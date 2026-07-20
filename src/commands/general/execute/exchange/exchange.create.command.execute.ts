import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import searchAnimeById from "../../../../command-interactions/anime/searchAnimeById";
import searchMangaById from "../../../../command-interactions/manga/searchMangaById";
import ErrorEmbed from "../../../../embeds/errorEmbed";
import GenericError from "../../../../errors/genericError";
import GuildChatInputCommandInteraction from "../../../../extensions/guildChatInputCommandInteraction.extension";
import AnimeEmbed from "../../../../embeds/animeEmbed";
import MangaEmbed from "../../../../embeds/mangaEmbed";

const exchangeCreateExecute = async (interaction: GuildChatInputCommandInteraction) => {
    const optionMember = interaction.options.getUser('member', true);
    const mediaType = interaction.options.getString('media-type', true);
    const mediaId = interaction.options.getNumber('media-id', true);

    if (optionMember.id == interaction.user.id) {
        return await interaction.reply({
            embeds: [new ErrorEmbed('¡No puedes crear un intercambio contigo mismo!')]
        });
    };

    await interaction.deferReply();

    let media;

    try {
        if (mediaType === 'ANIME') {
            media = await searchAnimeById(mediaId);
        } else if (mediaType === 'MANGA') {
            media = await searchMangaById(mediaId);
        } else {
            throw new GenericError();
        };
    } catch (error: any) {
        console.error(error);

        if (error.status === 404) {
            return await interaction.editReply({
                embeds: [new ErrorEmbed(`<@${interaction.user.id}>: No hemos encontrado una obra con el ID ingresado.`)],
                content: null,
                components: []
            });
        } else {
            return await interaction.editReply({
                embeds: [new ErrorEmbed(error.message)],
                content: null,
                components: []
            });
        };
    };

    const cacheID = Date.now().toString(36);

    const data = {
        memberAID: interaction.user.id,
        memberBID: optionMember.id,
        memberAMediaType: mediaType,
        memberAMediaID: mediaId,
        memberAMediaName: media.title.userPreferred,
        caches: [cacheID]
    };

    interaction.client.cache.set(cacheID, data);

    setTimeout(() => {
        interaction.client.cache.delete(cacheID);
    }, 180_000);

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder({
                style: ButtonStyle.Success,
                customId: `exchange-create-button-accept_${cacheID}`,
                label: '¡Aceptar intercambio!'
            })
        );

    const embed = data.memberAMediaType === 'ANIME' ? 
        new AnimeEmbed(media) : new MangaEmbed(media);

    await interaction.editReply({
        content: `<@${optionMember.id}>: ¡Puedes aceptar este intercambio!`,
        embeds: [embed],
        components: [row]
    });
};

export default exchangeCreateExecute;