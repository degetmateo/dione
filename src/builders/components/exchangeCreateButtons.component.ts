import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default class ExchangeCreateButtonsComponent extends ActionRowBuilder<ButtonBuilder> {
    constructor () {
        super();

        this.addComponents(
            new ButtonBuilder({
                style: ButtonStyle.Success,
                custom_id: 'exchange_create_button_accept',
                label: 'Aceptar',
            }),
            new ButtonBuilder({
                style: ButtonStyle.Danger,
                custom_id: 'exchange_create_button_reject',
                label: 'Rechazar',
            })
        );
    }
};