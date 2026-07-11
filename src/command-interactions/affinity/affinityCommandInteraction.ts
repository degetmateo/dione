import mongo from "../../database/mongo";
import AffinityEmbed from "../../embeds/affinityEmbed";
import GenericError from "../../errors/genericError";
import BChatInputCommandInteraction from "../../extensions/interaction";
import Helpers from "../../helpers";
import { MediaEntry } from "../../types/anilist";
import searchEntries from "./searchEntries";

export default class AffinityCommandInteraction {
    private interaction: BChatInputCommandInteraction;

    constructor (interaction: BChatInputCommandInteraction) {
        this.interaction = interaction;
    };

    async execute () {
        await this.interaction.deferReply();

        const member = this.interaction.options.getUser('member', true);
        
        const members = mongo.collection('members');

        const interactionMember = await members.findOne({ discord_id: this.interaction.user.id });
        if (!interactionMember) throw new GenericError('No estás registrado. 💔');

        const optionsMember = await members.findOne({ discord_id: member.id });
        if (!optionsMember) throw new GenericError(`<@${member.id}> no está registrado. 💔`);

        const data = await searchEntries(interactionMember.anilist.id, optionsMember.anilist.id);

        const interactionUserAnime: Array<MediaEntry> = data.u1_anime.lists[0].entries;
        const interactionUserManga: Array<MediaEntry> = data.u1_manga.lists[0].entries;

        const optionsUserAnime: Array<MediaEntry> = data.u2_anime.lists[0].entries;
        const optionsUserManga: Array<MediaEntry> = data.u2_manga.lists[0].entries;

        const interactionUserMedia = [...interactionUserAnime, ...interactionUserManga];
        const optionsUserMedia = [...optionsUserAnime, ...optionsUserManga];

        const pearson = Helpers.pearson(interactionUserMedia, optionsUserMedia);

        await this.interaction.editReply({
            embeds: [new AffinityEmbed({ 
                affinity: pearson, 
                userAId: this.interaction.user.id, 
                userBId: member.id 
            })]
        });
    };
};