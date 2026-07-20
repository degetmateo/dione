import mongo from "../../../../database/mongo";
import GuildChatInputCommandInteraction from "../../../../extensions/guildChatInputCommandInteraction.extension";
import Helpers from "../../../../helpers";
import animeExecuteId from "./anime.execute.id";
import animeExecuteName from "./anime.execute.name";

const animeExecute = async (interaction: GuildChatInputCommandInteraction) => {
    await interaction.deferReply();

    const args = interaction.options.getString('name-or-id') as string;
    interaction.data = { args };

    Helpers.isNumber(args) ?
        await animeExecuteId(interaction) :
        await animeExecuteName(interaction);
};

export default animeExecute;