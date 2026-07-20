import { ButtonInteraction, LabelBuilder, MessageFlags, ModalBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import ErrorEmbed from "../embeds/errorEmbed";

const execute = async (interaction: ButtonInteraction) => {
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

    if (interaction.user.id != data.memberBID) {
        return await interaction.reply({
            flags: [MessageFlags.Ephemeral],
            embeds: [new ErrorEmbed('¡Este intercambio no es para ti!')]
        });
    };

    const cacheID = Date.now().toString(36);

    data.caches.push(cacheID);

    bot.cache.set(cacheID, data);

    setTimeout(() => {
        bot.cache.delete(cacheID);
    }, 180_000);

    const modal = new ModalBuilder();
    modal.setCustomId(`exchange-create-modal_${cacheID}`);
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

    await interaction.showModal(modal);
};

module.exports = {
    execute,
    id: 'exchange-create-button-accept'
};