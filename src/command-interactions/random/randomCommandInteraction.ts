import { ChatInputCommandInteraction } from "discord.js";
import GenericError from "../../errors/genericError";
import getRandom from "./getRandom";
import Helpers from "../../helpers";
import AnimeEmbed from "../../embeds/animeEmbed";
import MangaEmbed from "../../embeds/mangaEmbed";
import mongo from "../../database/mongo";

export default class RandomCommandInteraction {
    private interaction: ChatInputCommandInteraction;
    
    constructor (interaction: ChatInputCommandInteraction) {
        this.interaction = interaction;
    };

    async execute () {
        await this.interaction.deferReply();

        const type = this.interaction.options.getString('type', true) as "ANIME" | "MANGA";

        const members = mongo.collection('members');
        const member = await members.findOne({ discord_id: this.interaction.user.id });

        if (!member) throw new GenericError('No estás registrado. Usa el comando `/setup` para registrarte.');

        const media = await getRandom({ type: type, user_id: member.anilist.id });
        
        if (media.length <= 0) throw new GenericError(`¡No tienes ${type.toUpperCase()} en tu PTW!`);

        const selected: any = Helpers.getRandomElement(media);

        const embed = type === 'ANIME' ?
            new AnimeEmbed(selected.data) :
            new MangaEmbed(selected.data);

        await this.interaction.editReply({
            embeds: [embed]
        });
    };
};