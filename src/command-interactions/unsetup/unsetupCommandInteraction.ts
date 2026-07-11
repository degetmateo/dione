import { MessageFlags } from "discord.js";
import GenericError from "../../errors/genericError";
import BChatInputCommandInteraction from "../../extensions/interaction";
import SuccessEmbed from "../../embeds/successEmbed";
import mongo from "../../database/mongo";

export default class UnsetupCommandInteraction {
    private interaction: BChatInputCommandInteraction;

    constructor (interaction: BChatInputCommandInteraction) {
        this.interaction = interaction;
    };

    async execute () {
        await this.interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const members = mongo.collection('members');
        const member = await members.findOneAndDelete({ discord_id: this.interaction.user.id });

        if (!member) throw new GenericError("No estás registrado.");

        await this.interaction.editReply({
            embeds: [new SuccessEmbed("Eliminé correctamente tu cuenta.")]
        });
    };
};