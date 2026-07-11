import { ButtonInteraction, LabelBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import ComponentsID from "../../../static/componentsId";

module.exports = {
    id: ComponentsID.SetupButton,
    execute: async (interaction: ButtonInteraction) => {
        try {
            const modal = new ModalBuilder()
                .setCustomId(ComponentsID.SetupModal) 
                .setTitle('Ingresá tu código.');

            const codeInput = new TextInputBuilder()
                .setCustomId(ComponentsID.SetupInput) 
                .setStyle(TextInputStyle.Paragraph) 
                .setPlaceholder('Pegá tu código acá...')
                .setRequired(true); 

            const label = new LabelBuilder({
                label: 'Ingresá tu código.'
            }).setTextInputComponent(codeInput);

            modal.addLabelComponents(label);

            await interaction.showModal(modal);
        } catch (error) {
            console.error(error);  
        };
    }
};