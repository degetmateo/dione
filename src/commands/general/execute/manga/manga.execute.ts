import GuildChatInputCommandInteraction from "../../../../extensions/guildChatInputCommandInteraction.extension";
import Helpers from "../../../../helpers";
import mangaExecuteId from "./manga.execute.id";
import mangaExecuteName from "./manga.execute.name";

const mangaExecute = async (interaction: GuildChatInputCommandInteraction) => {
    await interaction.deferReply();

    const args = interaction.options.getString('name-or-id') as string;
    interaction.data = { args };

    Helpers.isNumber(args) ?
        await mangaExecuteId(interaction) :
        await mangaExecuteName(interaction);
};

export default mangaExecute;