import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export interface UserActionRowData {
    id: string;
    profile: boolean;
    anilist: boolean;
    mal: boolean;
    vndb: boolean;
}

export class UserActionRowBuilder extends ActionRowBuilder<ButtonBuilder> {
    public readonly count: number = 0;

    public constructor(data: UserActionRowData) {
        super();

        let count = 0;
        if (data.anilist) {
            count++;
            this.addComponents(
                new ButtonBuilder()
                    .setCustomId(`user-anilist-button_${data.id}`)
                    .setLabel('Ver ANILIST')
                    .setStyle(ButtonStyle.Primary)
            );
        }
        if (data.mal) {
            count++;
            this.addComponents(
                new ButtonBuilder()
                    .setCustomId(`user-mal-button_${data.id}`)
                    .setLabel('Ver MAL')
                    .setStyle(ButtonStyle.Primary)
            );
        }
        if (data.vndb) {
            count++;
            this.addComponents(
                new ButtonBuilder()
                    .setCustomId(`user-vndb-button_${data.id}`)
                    .setLabel('Ver VNDB')
                    .setStyle(ButtonStyle.Primary)
            );
        }
        if (data.profile) {
            count++;
            this.addComponents(
                new ButtonBuilder()
                    .setCustomId(`user-default-button_${data.id}`)
                    .setLabel('Ver PERFIL')
                    .setStyle(ButtonStyle.Primary)
            );
        }
        this.count = count;
    }

    public isValid(): boolean {
        return this.count >= 1;
    }
}

