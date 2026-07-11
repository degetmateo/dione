import { 
    ChatInputCommandInteraction, 
    MessageFlags,
} from "discord.js";

import SetupInstructionsEmbed from "../../embeds/setupInstructionsEmbed";
import SetupInstructionsRow from "../../components/setupInstructionsRow";

export default class SetupCommandInteraction {
    private interaction: ChatInputCommandInteraction;
    
    constructor (interaction: ChatInputCommandInteraction) {
        this.interaction = interaction;
    };

    async execute () {
        const response = await this.interaction.reply({
            flags: [MessageFlags.Ephemeral],
            embeds: [new SetupInstructionsEmbed()],
            components: [new SetupInstructionsRow()]
        });
    };
};