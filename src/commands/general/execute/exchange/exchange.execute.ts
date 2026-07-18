import ExchangeHelpEmbed from "../../../../builders/embeds/exchangeHelp.embed";
import GuildChatInputCommandInteraction from "../../../../extensions/guildChatInputCommandInteraction.extension";
import exchangeCreateExecute from "./exchange.create.execute";

const exchangeExecute = async (interaction: GuildChatInputCommandInteraction) => {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'help') {
        return await interaction.reply({
            embeds: [new ExchangeHelpEmbed()]
        });
    };

    await interaction.deferReply();

    if (subcommand === 'create') {
        return await exchangeCreateExecute(interaction);
    };

    if (subcommand === 'complete') {
        await interaction.editReply({
            content: "exchamge complete"
        });
    };

    if (subcommand === 'cancel') {
        await interaction.editReply({
            content: "exchamge cancel"
        });
    };
};

export default exchangeExecute;