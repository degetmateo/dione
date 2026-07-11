import { MessageFlags } from "discord.js";
import HelpEmbed from "../../embeds/helpEmbed";
import BChatInputCommandInteraction from "../../extensions/interaction";

export default class HelpCommandInteraction {
    private interaction: BChatInputCommandInteraction;

    constructor (interaction: BChatInputCommandInteraction) {
        this.interaction = interaction;
    };

    async execute () {
        await this.interaction.reply({
            embeds: [new HelpEmbed()],
            flags: [MessageFlags.Ephemeral]
        });
    };
};