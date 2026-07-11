import { MessageFlags } from "discord.js";
import SuccessEmbed from "../../embeds/successEmbed";
import BChatInputCommandInteraction from "../../extensions/interaction";
import GenericError from "../../errors/genericError";
import mongo from "../../database/mongo";

export default class ShowScoresCommandInteraction {
    private interaction: BChatInputCommandInteraction;

    constructor (interaction: BChatInputCommandInteraction) {
        this.interaction = interaction;
    };

    async execute () {
        await this.interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        
        const enabled = this.interaction.options.getBoolean('enabled', true);
    
        const members = mongo.collection('members');
        const member = await members.findOne({ discord_id: this.interaction.user.id });
        
        if (!member) throw new GenericError('No estás registrado. Usa \`/setup\`.');

        let guild: any = null;
        let i = 0;

        while (i < member.guilds.length) {
            if (member.guilds[i].id == this.interaction.guild?.id) {
                guild = member.guilds[i];
                break;
            };

            i++;
        };

        if (!guild) {
            member.guilds.push({
                id: this.interaction.guild?.id,
                show_scores: enabled
            });
        } else {
            member.guilds[i].show_scores = enabled;
        };

        await members.updateOne({ _id: member._id }, { $set: { guilds: member.guilds } });

        await this.interaction.editReply({
            embeds: [new SuccessEmbed(enabled ? 'Ahora tus puntuaciones se mostrarán en este servidor.' : 'Ahora tus puntuaciones NO se mostrarán en este servidor.')]
        });
    };
};  