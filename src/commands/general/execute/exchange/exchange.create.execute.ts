import { ButtonInteraction, LabelBuilder, MessageFlags, ModalBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import searchAnimeById from "../../../../command-interactions/anime/searchAnimeById";
import searchMangaById from "../../../../command-interactions/manga/searchMangaById";
import mongo from "../../../../database/mongo";
import ErrorEmbed from "../../../../embeds/errorEmbed";
import GenericError from "../../../../errors/genericError";
import GuildChatInputCommandInteraction from "../../../../extensions/guildChatInputCommandInteraction.extension";
import ExchangeMediaEmbed from "../../../../builders/embeds/exchangeMedia.embed";
import ExchangeCreateButtonsComponent from "../../../../builders/components/exchangeCreateButtons.component";
import SuccessEmbed from "../../../../embeds/successEmbed";

const exchangeExecuteCreate = async (interaction: GuildChatInputCommandInteraction) => {
    const optionMember = interaction.options.getUser('member', true);
    const mediaType = interaction.options.getString('media-type', true);
    const mediaId = interaction.options.getNumber('media-id', true);

    if (optionMember.id == interaction.user.id) {
        return await interaction.editReply({
            embeds: [new ErrorEmbed('¡No puedes crear un intercambio contigo mismo!')]
        });
    };

    const members = mongo.collection('members');
    const memberA = await members.findOne({ discord_id: interaction.user.id });
    
    if (!memberA) {
        return await interaction.editReply({
            embeds: [new ErrorEmbed('No estás registrado. Utilizá \`/setup\` para registrarte.')]
        });
    };

    if (memberA.exchanges) {
        if (memberA.exchanges.active) {
            return await interaction.editReply({
                embeds: [new ErrorEmbed('¡Ya tienes un intercambio activo!')]
            });
        };
    };

    const memberB = await members.findOne({ discord_id: optionMember.id });

    if (!memberB) {
        return await interaction.editReply({
            embeds: [new ErrorEmbed(`<@${optionMember.id}> no está registrado. Debe usar \`/setup\` para registrarse.`)]
        });
    };

    if (memberB.exchanges) {
        if (memberB.exchanges.active) {
            return await interaction.editReply({
                embeds: [new ErrorEmbed(`¡<@${optionMember.id}> ya tiene un intercambio activo!`)]
            });
        };
    };

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
                embeds: [new ErrorEmbed("No hemos encontrado una obra con el ID ingresado.")],
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

    const memberBResponse = await interaction.editReply({
        content: `<@MEMBER_ID>: ¡Puedes aceptar este intercambio!`,
        embeds: [new ExchangeMediaEmbed(media)],
        components: [new ExchangeCreateButtonsComponent()]
    });

    const memberBCollector = memberBResponse.createMessageComponentCollector({ time: 120_000 });

    memberBCollector.on('collect', async (memberBButtonInteraction: ButtonInteraction) => {
        try {
            if (memberBButtonInteraction.user.id != optionMember.id) {
                return await memberBButtonInteraction.reply({
                    flags: [MessageFlags.Ephemeral],
                    embeds: [new ErrorEmbed('¡Este intercambio no es para ti!')]
                });
            };

            if (memberBButtonInteraction.customId === 'exchange_create_button_reject') {
                memberBCollector.stop();

                await interaction.editReply({
                    components: []
                });

                return await memberBButtonInteraction.reply({
                    embeds: [new ErrorEmbed(`<@${optionMember.id}> rechazó este intercambio.`)]
                });
            };

            if (memberBButtonInteraction.customId === 'exchange_create_button_accept') {
                const modal = new ModalBuilder();
                modal.setCustomId('exchange_create_modal');
                modal.setTitle('¡Escoge la obra que intercambiarás!');

                const select = new StringSelectMenuBuilder();
                select.setCustomId('exchange_type_select');
                select.setRequired(true);
                select.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('ANIME')
                        .setValue('ANIME'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('MANGA')
                        .setValue('MANGA')
                );

                const labelSelect = new LabelBuilder({ label: "Seleccioná el tipo de obra." });
                labelSelect.setStringSelectMenuComponent(select);

                const idInput = new TextInputBuilder();
                idInput.setCustomId('exchange_id_input');
                idInput.setRequired(true);
                idInput.setStyle(TextInputStyle.Short);
                idInput.setPlaceholder('La ID de tu obra...');

                const labelInput = new LabelBuilder({ label: "Ingresá la ID de la obra." });
                labelInput.setTextInputComponent(idInput);

                modal.addLabelComponents(labelSelect, labelInput);

                await memberBButtonInteraction.showModal(modal);
                const memberBCollectedModal = await memberBButtonInteraction.awaitModalSubmit({ time: 300_000 });

                const idMediaMemberB = memberBCollectedModal.fields.getTextInputValue('exchange_id_input');
                const valuesMediaMemberB = memberBCollectedModal.fields.getStringSelectValues('exchange_type_select');
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
                        return await memberBCollectedModal.reply({
                            flags: [MessageFlags.Ephemeral],
                            embeds: [new ErrorEmbed("No hemos encontrado una obra con el ID ingresado.")]
                        });
                    } else {
                        return await memberBCollectedModal.reply({
                            flags: [MessageFlags.Ephemeral],
                            embeds: [new ErrorEmbed(error.message)]
                        });
                    };
                };

                await memberBCollectedModal.reply({
                    embeds: [new SuccessEmbed(`<@${optionMember.id}> aceptó este intercambio.`)]
                });

                const memberAResponse = await interaction.followUp({
                    content: `<@${interaction.user.id}>: ¿Quieres aceptar este intercambio?`,
                    embeds: [new ExchangeMediaEmbed(mediaB)],
                    components: [new ExchangeCreateButtonsComponent()]
                });
                
                const memberACollector = memberAResponse.createMessageComponentCollector({ time: 60_000 });
                
                memberACollector.on('collect', async (memberAButtonInteraction: ButtonInteraction) => {
                    try {
                        if (memberAButtonInteraction.user.id != interaction.user.id) {
                            return await memberAButtonInteraction.reply({
                                flags: [MessageFlags.Ephemeral],
                                embeds: [new ErrorEmbed('¡Este intercambio no es para ti!')]
                            });
                        };

                        memberACollector.stop();

                        await memberAResponse.edit({
                            components: []
                        });

                        if (memberAButtonInteraction.customId === 'exchange_create_button_reject') {
                            return await memberAButtonInteraction.reply({
                                embeds: [new ErrorEmbed(`<@${interaction.user.id}> rechazó este intercambio.`)]
                            });
                        };

                        if (memberAButtonInteraction.customId === 'exchange_create_button_accept') {
                            await members.updateOne(
                                { _id: memberA._id },
                                { $set: { 'exchanges.active': { 
                                    member: { 
                                        discord_id: optionMember.id, 
                                        media_id: mediaId,
                                        media_type: mediaType
                                    },
                                    media_id: idMediaMemberB,
                                    media_type: typeMediaMemberB
                                } } }
                            );

                            await members.updateOne(
                                { _id: memberB._id },
                                { $set: { 'exchanges.active': { 
                                    member: { 
                                        discord_id: interaction.user.id, 
                                        media_id: idMediaMemberB,
                                        media_type: typeMediaMemberB
                                    },
                                    media_id: mediaId,
                                    media_type: mediaType
                                } } }
                            );

                            await memberAButtonInteraction.reply({
                                embeds: [new SuccessEmbed(`<@${interaction.user.id}> y <@${optionMember.id}> iniciaron un intercambio 🤝.`)]
                            });
                        };                        
                    } catch (e3) {
                        console.error(e3);
                        memberBCollector.stop();
                        memberACollector.stop();
                        try {
                            await interaction.followUp({
                                embeds: [new ErrorEmbed(`Ha ocurrido un error inesperado. Inténtalo más tarde.`)]
                            });
                        } catch (e4) {
                            console.error(e4);
                        };
                    };
                });
            };      
        } catch (error) {
            console.error(error);
            try {
                memberBCollector.stop();
                await interaction.followUp({
                    embeds: [new ErrorEmbed(`Ha ocurrido un error inesperado. Inténtalo más tarde.`)]
                });                
            } catch (e2) {
                console.error(e2);   
            };
        };
    });
};

export default exchangeExecuteCreate;