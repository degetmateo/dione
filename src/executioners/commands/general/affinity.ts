import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import BChatInputCommandInteraction from "../../../extensions/interaction";
import GenericError from "../../../errors/genericError";
import mongo from "../../../database/mongo";
import { MediaEntry } from "../../../types/anilist";
import Helpers from "../../../helpers";
import AffinityEmbed from "../../../embeds/affinityEmbed";
import searchEntries from "../../../command-interactions/affinity/searchEntries";
import guildsRepository from "../../../repositories/guilds/guilds.repository";

const execute = async (interaction: BChatInputCommandInteraction) => {
    await interaction.deferReply();

    const memberOptionA = interaction.options.getUser('member', true);
    const memberOptionB = interaction.options.getUser('member-b', false) || interaction.user;

    const members = mongo.collection('members');

    const memberB = await members.findOne({ discord_id: memberOptionB.id });

    if (!memberB) { 
        if(memberOptionB.id === interaction.user.id) {
            throw new GenericError('No estás registrado. 💔');
        } else {
            throw new GenericError(`<@${memberOptionB.id}> no está registrado. 💔`);
        };
    };

    const memberA = await members.findOne({ discord_id: memberOptionA.id });
    if (!memberA) throw new GenericError(`<@${memberOptionA.id}> no está registrado. 💔`);

    const data = await searchEntries(memberB.anilist.id, memberA.anilist.id);

    const interactionUserAnime: Array<MediaEntry> = data.u1_anime.lists[0].entries;
    const interactionUserManga: Array<MediaEntry> = data.u1_manga.lists[0].entries;

    const optionsUserAnime: Array<MediaEntry> = data.u2_anime.lists[0].entries;
    const optionsUserManga: Array<MediaEntry> = data.u2_manga.lists[0].entries;

    const interactionUserMedia = [...interactionUserAnime, ...interactionUserManga];
    const optionsUserMedia = [...optionsUserAnime, ...optionsUserManga];

    const pearson = Helpers.pearson(interactionUserMedia, optionsUserMedia);

    await interaction.editReply({
        embeds: [new AffinityEmbed({ 
            affinity: pearson, 
            userAId: memberOptionA.id, 
            userBId: memberOptionB.id 
        })]
    });

    guildsRepository.update.affinityTop(interaction.guild.id, {
        pearson: pearson,
        pair: {
            a: { discord_id: memberOptionA.id },
            b: { discord_id: memberOptionB.id }
        }
    });
};

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('affinity')
        .setDescription('Affinity between two users!')
        .setDescriptionLocalization('es-ES', '¡La afinidad entre dos usuarios!')
        .setDescriptionLocalization('es-419', '¡La afinidad entre dos usuarios!')
        .setContexts(InteractionContextType.Guild)
        .setNSFW(false)
        .addUserOption(option => {
            return option
                .setName('member')
                .setDescription('The member you want to calculate the affinity.')
                .setRequired(true)
        })
        .addUserOption(option => {
            return option
                .setName('member-b')
                .setDescription('Another member (optional).')
                .setRequired(false)
        }),
    execute: execute
};