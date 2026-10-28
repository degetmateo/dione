import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export class VnActionRowBuilder extends ActionRowBuilder<ButtonBuilder> {
    public constructor(id: string) {
        super();
        this.addComponents(
            new ButtonBuilder()
                .setCustomId(`vn-button-back_${id}`)
                .setLabel('←')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`vn-button-next_${id}`)
                .setLabel('→')
                .setStyle(ButtonStyle.Primary)
        );
    }
}

