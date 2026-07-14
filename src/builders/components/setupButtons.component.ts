import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { ANILIST_AUTH_URL } from "../../consts";
import ComponentsID from "../../static/componentsId";

export default class SetupButtonsComponent extends ActionRowBuilder<ButtonBuilder> {
    constructor () {
        super();

        this.addComponents(
            new ButtonBuilder({
                style: ButtonStyle.Link,
                url: ANILIST_AUTH_URL,
                label: 'Autorizar'
            }),
            new ButtonBuilder({
                style: ButtonStyle.Primary,
                custom_id: ComponentsID.SetupButton,
                label: 'Ingresar código',
            })
        );
    }
};