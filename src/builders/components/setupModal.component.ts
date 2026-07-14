import { LabelBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import ComponentsID from "../../static/componentsId";

export default class SetupModalComponent extends ModalBuilder {
    constructor () {
        super();

        this.setCustomId(ComponentsID.SetupModal) 
        this.setTitle('Ingresá tu código.');

        const codeInput = new TextInputBuilder()
            .setCustomId(ComponentsID.SetupInput) 
            .setStyle(TextInputStyle.Paragraph) 
            .setPlaceholder('Pegá tu código acá...')
            .setRequired(true); 

        const label = new LabelBuilder({
            label: 'Ingresá tu código.'
        }).setTextInputComponent(codeInput);

        this.addLabelComponents(label);
    };
};